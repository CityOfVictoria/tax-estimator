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
*/
var TaxRow = React.createClass({
    calculateAmount: function(){
        if(!!this.props.optional && !this.props.included){
            return 0;
        }
        return (this.props.rate * (this.props.value/1000));
    },
    handleChangeIncluded:function(e){
        this.props.onIncludedChanged(this.props.tax, e.target.checked);
    },
    taxLabel:function(){
        if(!!this.props.optional){
            return <span>
                <label htmlFor={'include-'+this.props.tax}>{this.props.tax} </label>
                <input id={'include-'+this.props.tax} type="checkbox" checked={this.props.included} onChange={this.handleChangeIncluded} />
            </span>;
        }else return this.props.tax;
    },
    classNames: function(base){
        var ba = base.split(' ');
        if(!!this.props.optional && !this.props.included){
            ba.push('not-included')
        }
        return ba.join(' ');
    },
    render:function(){
        var amount = this.calculateAmount().toFixed(2);
        return (
            <tr>
                <td className="text-column">{this.taxLabel()}</td>
                <td className={this.classNames('number-column ')}>{this.props.rate}</td>
                <td className={this.classNames('number-column ')}>${amount}</td>
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
            return a + this.props.baseRates[k];
        }.bind(this),0.0);
        
        var optional = Object.getOwnPropertyNames(this.props.optionalRates).reduce(function(a,k){
            return this.props.included[k] ?
                a + this.props.optionalRates[k] :
                a;
        }.bind(this),0.0);
        
        return base + optional;
    },
    calculateTotalAmount: function(){
        var base = Object.getOwnPropertyNames(this.props.baseRates).reduce(function(a,k){
            return a + (this.props.baseRates[k] * (this.props.value/1000));
        }.bind(this),0.0);
        
        var optional = Object.getOwnPropertyNames(this.props.optionalRates).reduce(function(a,k){
            return this.props.included[k] ?
                a + (this.props.optionalRates[k] * (this.props.value/1000)):
                a;
        }.bind(this),0.0);
        
        return base + optional;
    },
    render:function(){
        return (
            <tr>
                <th className="text-column">Total</th>
                <th className="number-column">{this.calculateTotalRate()}</th>
                <th className="number-column">${this.calculateTotalAmount().toFixed(2)}</th>
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
            includedOptionalTaxes:{}
        }
    },
    handleChangeIncluded:function(tax, included){
        var updatedTaxes = this.state.includedOptionalTaxes;
        updatedTaxes[tax]=included;
        this.setState({
            includedOptionalTaxes:updatedTaxes
        });
    },
    render:function(){
        return (
            <section>
                <div>                    
                    <table className="tax-rate-table">
                        <thead>
                            <tr>
                                <th className="text-column">Tax</th>
                                <th className="number-column">Rate</th>
                                <th className="number-column">Amount</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <TaxSum 
                                baseRates={this.props.taxRates.main}
                                optionalRates={this.props.taxRates.optional} included={this.state.includedOptionalTaxes}
                                value={this.props.assessedValue} />
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
            assessedValue:200000,
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
        return ks.map(function(k){
            return <span className="rateTableTab">
                <label htmlFor={'rateTable-'+k}>{k}</label>
                <input type="radio" name="selectedRateTable" id={'rateTable-'+k} checked={this.state.selectedRateTable==k} onChange={this.handleChangeSelectedRateTable}/>
            </span>;
        }.bind(this));
    },
    render:function(){
        return (
            <section>
                <section>
                    <label htmlFor="assessedValue">Assessed Value </label>
                    <input id="assessedValue" type="number" value={this.state.assessedValue} onChange={this.handleChangeAssessedValue}/>
                </section>
                <section>
                    {this.renderRateTableSelectors()}
                    <TaxTable assessedValue={this.state.assessedValue} taxRates={this.props.rates[this.state.selectedRateTable]} />
                </section>
            </section>
        );
    }
});

React.render(
    React.createElement(TaxEstimator,{rates:{
        "Residential": ResidentialTaxRates,
        "Business": BusinessTaxRates
    }})
    , document.querySelector('tax-estimator')
);