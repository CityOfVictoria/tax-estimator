/*
    TaxRow Component
    Calculates and displays ONE row in the tax table
    Properties:
        tax: name of tax
        rate: rate of tax per 1000$
        value: assessed value of property
*/
var TaxRow = React.createClass({
    render:function(){
        var amount = (this.props.rate * (this.props.value/1000)).toFixed(2);
        return (
            <tr>
                <td className="text-column">{this.props.tax}</td>
                <td className="number-column">{this.props.rate}</td>
                <td className="number-column">${amount}</td>
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
        value: assessed value of property
*/
var TaxSum = React.createClass({
    render:function(){
        var totalRate = (function(rates){
            return Object.getOwnPropertyNames(rates).reduce(function(a,k){
                return a + rates[k];
            },0);
        })(this.props.rates);
        var amount = (function(rates, value){
            return Object.getOwnPropertyNames(rates).reduce(function(a,k){
                return a + (rates[k] * (value/1000));
            },0);
        })(this.props.rates, this.props.value).toFixed(2);
        
        return (
            <tr>
                <th className="text-column">Total</th>
                <th className="number-column">{totalRate}</th>
                <th className="number-column">${amount}</th>
            </tr>
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
        var opts = TaxRates.optional;
        return {
            assessedValue:200000,
            optionalTaxes:Object.getOwnPropertyNames(opts).map(function(k){ return {tax:k, rate:opts[k], selected:undefined };})
        };
    },
    handleChangeAssessedValue:function(e){
        this.setState({
            assessedValue: e.target.value,
            optionalTaxes:this.state.optionalTaxes
        });
    },
    handleSelectOption: function(e){        
        var changedOption = this.state.optionalTaxes.filter(function(o){return o.tax==e.target.id});
        if(changedOption && changedOption.length>0){
            changedOption[0].selected=e.target.checked;
            this.setState({
                assessedValue: this.state.assessedValue,
                optionalTaxes: this.state.optionalTaxes
            });
        }
    },
    render:function(){
        return (
            <section>
                <div>
                    <label for="assessedValue">Assessed Value </label>
                    <input id="assessedValue" type="number" value={this.state.assessedValue} onChange={this.handleChangeAssessedValue}/>
                </div>
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
                            <TaxSum rates={TaxRates.main} value={this.state.assessedValue} /> 
                        </tfoot>
                        <tbody>
                        {(function(rates, value){
                            return Object.getOwnPropertyNames(rates).map(function(k){
                                return <TaxRow key={k} tax={k} rate={rates[k]} value={value} />;
                            });
                        })(TaxRates.main, this.state.assessedValue)}
                        </tbody>
                        <tbody>
                        {this.state.optionalTaxes.filter(function(o){return o.selected;}).map(function(option){
                            return <TaxRow key={option.tax} tax={option.tax} rate={option.rate} value={this.state.assessedValue} />;
                        }.bind(this))}
                        </tbody>
                    </table>
                </div>
                <div>
                    <table>
                        <tbody>
                        {this.state.optionalTaxes.map(function(option){
                            return <tr>
                                    <td>{option.tax}</td>
                                    <td><input type="checkbox" id={option.tax} checked={option.selected} onChange={this.handleSelectOption} /></td>
                                </tr>;
                        }.bind(this))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
});

React.render(
    <TaxEstimator />, 
    document.querySelector('tax-estimator')
);