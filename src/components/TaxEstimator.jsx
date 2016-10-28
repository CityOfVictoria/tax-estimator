/*
    Tax Estimator
    Copyright (C) 2015 City of Victoria

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


function round(value, decimals){
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

var TaxCalculator = {
    isNotAssessedValueTax: function isNotAssessedValueTax(rate){
        return typeof(rate)=='object';
    },
    getNonAssessedValueTaxAmountName: function getNonAssessedValueTaxAmountName(rate){
        var firstRate = Object.getOwnPropertyNames(rate)[0];
        return firstRate;
    },
    getNonAssessedValueTaxRate: function getNonAssessedValueTax(rate){
        return rate[this.getNonAssessedValueTaxAmountName(rate)];
    },
    calculate: function calculateTax(rate, value, amount){
        if (this.isNotAssessedValueTax(rate)){
            return this.getNonAssessedValueTaxRate(rate) * amount;
        }
        return round(rate * (value/1000),2);
    }
};


/*
    TaxRow Component
    Calculates and displays ONE row in the tax table
    Properties:
        tax: name of tax
        rate: rate of tax per 1000$
        value: assessed value of property
        optional: is the tax a optional tax for the table (user can include/disclude)
        included: user has decided to include/disclude this optional tax
        onIncludedChanged: handler for what to do when user changes included (function (tax, included){})
        amount: this tax is not based on assessed value, but some other thing
        onAmountChanged: handler for changing the amoun (function(tax, amaount){})
*/
var TaxRow = React.createClass({
    calculateAmount: function(){
        if(!!this.props.optional && !this.props.included){
            return 0;
        }
        return TaxCalculator.calculate(this.props.rate, this.props.value, this.props.amount);
    },
    handleChangeIncluded:function(e){
        this.props.onIncludedChanged(this.props.tax, e.target.checked);
    },
    handleChangeAmount:function(e){
        this.props.onAmountChanged(this.props.tax, e.target.value);
    },
    taxLabel:function(){
        var labelContents=[];
        
        if(!!this.props.optional){
            labelContents.push(
                <label htmlFor={'include-'+this.props.tax}>{this.props.tax}</label>
            );
            labelContents.push(
                <input id={'include-'+this.props.tax} type="checkbox" checked={this.props.included} onChange={this.handleChangeIncluded} />
            );
        } else {
            labelContents.push(this.props.tax);
        }
        
        if(TaxCalculator.isNotAssessedValueTax(this.props.rate)){
            labelContents.push(
                <label htmlFor={'amount-'+this.props.tax}>{TaxCalculator.getNonAssessedValueTaxAmountName(this.props.rate)}</label> 
            );
            labelContents.push(
                <input id={'amount-'+this.props.tax} type="number" value={this.props.amount} onChange={this.handleChangeAmount} />
            );
        }
        return <span>{labelContents}</span>;
    },
    getRate:function(){
        if(TaxCalculator.isNotAssessedValueTax(this.props.rate)){
            return <span>
                {TaxCalculator.getNonAssessedValueTaxRate(this.props.rate)} {TaxCalculator.getNonAssessedValueTaxAmountName(this.props.rate)}
            </span>;
        }else{
            return this.props.rate;
        }
    },
    styles: function(base){
        if(!!this.props.optional && !this.props.included){
            base.opacity=0.4;
        }
        return base;
    },
    render:function(){
        var amount = accounting.formatMoney(this.calculateAmount());
        return (
            <tr>
                <td style={{textAlign:'left'}}>{this.taxLabel()}</td>
                <td style={this.styles({textAlign:'right'})}>{this.getRate()}</td>
                <td style={this.styles({textAlign:'right'})}>{amount}</td>
            </tr>
        );
    }
});

/*
    TaxSum Component
    Sums all taxes for a property based on value for the tax table
    Properties:
        baseRates: base tax rates
        optionalRates: user-selected rates (for local services, home owner grant and the like)
        included: which of the optional rates are included
        value: assessed value of property
*/
var TaxSum = React.createClass({
    calculateTotalRate: function(){
        var base = Object.getOwnPropertyNames(this.props.baseRates).reduce(function(a,k){
            return a + (TaxCalculator.isNotAssessedValueTax(this.props.baseRates[k]) ? 0: this.props.baseRates[k]);
        }.bind(this),0.0);
        
        var optional = Object.getOwnPropertyNames(this.props.optionalRates).reduce(function(a,k){
            return a + (this.props.included[k] ? (TaxCalculator.isNotAssessedValueTax(this.props.optionalRates[k]) ? 0: this.props.optionalRates[k]): 0);
        }.bind(this),0.0);
        
        return round(base + optional,4);
    },
    calculateTotalAmount: function(){
        var base = Object.getOwnPropertyNames(this.props.baseRates).reduce(function(a,k){
            return a + TaxCalculator.calculate(this.props.baseRates[k], this.props.value, this.props.amounts[k]);
        }.bind(this),0.0);
        
        var optional = Object.getOwnPropertyNames(this.props.optionalRates).reduce(function(a,k){
            return a + (this.props.included[k] ? TaxCalculator.calculate(this.props.optionalRates[k], this.props.value, this.props.amounts[k]): 0);
        }.bind(this),0.0);
        
        return accounting.formatMoney(base + optional);
    },
    render:function(){
        return (
            <tr>
                <th style={{textAlign:'left'}}>Total</th>
                <th style={{textAlign:'right'}}>{this.calculateTotalRate()}</th>
                <th style={{textAlign:'right'}}>{this.calculateTotalAmount()}</th>
            </tr>
        );
    }
});

/*
    TaxTable Component
    Displays the taxes for a given assessed value for a set of tax rates
    Properties:
        assessedValue: the value of the property
        taxRates: object of the possible tax rates
*/
var TaxTable = React.createClass({
    getInitialState:function(){
        return {
            includedOptionalTaxes:{},
            amountsForNonValueTaxes:{}
        };
    },
    handleChangeIncluded:function(tax, included){
        var updatedTaxes = this.state.includedOptionalTaxes;
        var updatedAmounts = this.state.amountsForNonValueTaxes;
        
        updatedTaxes[tax] = included;
        if(TaxCalculator.isNotAssessedValueTax(this.props.taxRates.optional[tax]) && !updatedAmounts[tax]) updatedAmounts[tax]=0;
        
        this.setState({
            includedOptionalTaxes: updatedTaxes,
            amountsForNonValueTaxes: updatedAmounts
        });
    },
    handleChangeAmountForNonValueTaxes:function(tax,amount){
        var updatedAmounts = this.state.amountsForNonValueTaxes;
        updatedAmounts[tax] = amount;
        this.setState({
            includedOptionalTaxes: this.state.includedOptionalTaxes,
            amountsForNonValueTaxes: updatedAmounts
        });
    },
    render:function(){
        return (
            <section>
                <div>                    
                <table style={{width:'100%'}}>
                        <thead>
                            <tr>
                                <th style={{textAlign:'left'}}>Tax</th>
                                <th style={{textAlign:'right'}}>Rate</th>
                                <th style={{textAlign:'right'}}>Amount</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <TaxSum 
                                baseRates={this.props.taxRates.main}
                                optionalRates={this.props.taxRates.optional} included={this.state.includedOptionalTaxes}
                                value={this.props.assessedValue} amounts={this.state.amountsForNonValueTaxes} />
                        </tfoot>
                        <tbody>
                        {
                            Object.getOwnPropertyNames(this.props.taxRates.main).map(function(k){
                                return <TaxRow key={k} tax={k} rate={this.props.taxRates.main[k]} value={this.props.assessedValue} />;
                            }.bind(this))
                        }
                        </tbody>
                        <tbody>
                            {Object.getOwnPropertyNames(this.props.taxRates.optional).map(function(k){
                                return <TaxRow key={k} tax={k} 
                                    rate={this.props.taxRates.optional[k]} 
                                    value={this.props.assessedValue} 
                                    optional="true" included={this.state.includedOptionalTaxes[k]} onIncludedChanged={this.handleChangeIncluded}
                                    amount={this.state.amountsForNonValueTaxes[k]} onAmountChanged={this.handleChangeAmountForNonValueTaxes}
                                    />;
                            }.bind(this))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
});

/*
    TaxEstimator Component
    Estimates your taxes
    Properties: NONE
*/
var TaxEstimator = React.createClass({
    getInitialState: function(){
        return {
            assessedValue:this.props.initialDefaultValue,
            selectedRateTable:'Residential'
        };
    },
    handleChangeAssessedValue:function(e){
        this.setState({
            assessedValue: e.target.value,
            selectedRateTable:this.state.selectedRateTable
        });
    },
    handleChangeSelectedRateTable:function(e){
        console.log(e.target.id.substring('rateTable-'.length));
        this.setState({
            assessedValue:this.state.assessedValue,
            selectedRateTable:e.target.id.substring('rateTable-'.length)
        });
    },
    renderRateTableSelectors:function(){
        var ks = Object.getOwnPropertyNames(this.props.rates);
        var selectors = ks.map(function(k){
            return <td>
                <label htmlFor={'rateTable-'+k}>{k}</label>
                <input type="radio" name="selectedRateTable" id={'rateTable-'+k} checked={this.state.selectedRateTable==k} onChange={this.handleChangeSelectedRateTable}/>
            </td>;
        }.bind(this));
        return <table style={{borderWidth:0}}><tr>
            {selectors}
            </tr></table>
    },
    render:function(){
        return (
            <section>
                <section>
                    <label htmlFor="assessedValue">Assessed Value </label>
                    <input id="assessedValue" value={this.state.assessedValue} onChange={this.handleChangeAssessedValue}/>
                </section>
                <section>
                    {this.renderRateTableSelectors()}
                    <TaxTable assessedValue={accounting.unformat(this.state.assessedValue)} taxRates={this.props.rates[this.state.selectedRateTable]} />
                </section>
            </section>
        );
    }
});

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

var taxnode = document.createElement('div');
var currentScript = document.currentScript || (function() {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
insertAfter(currentScript, taxnode);

React.render(
    React.createElement(TaxEstimator,{rates:{
        "Residential": ResidentialTaxRates,
        "Business": BusinessTaxRates
        }, initialDefaultValue:'$0.00'}), taxnode
);