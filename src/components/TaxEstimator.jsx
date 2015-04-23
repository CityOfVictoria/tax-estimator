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

var TaxEstimator = React.createClass({
    getInitialState: function(){
        return {
            assessedValue:200000
        };
    },
    handleChange:function(e){
        this.setState({
            assessedValue: e.target.value
        });
    },
    render:function(){
        return (
            <div>
                <div>
                    <label for="assessedValue">Assessed Value </label>
                    <input id="assessedValue" type="number" value={this.state.assessedValue} onChange={this.handleChange}/>
                </div>
                <section>                    
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
                    </table>
                </section>
            </div>
        );
    }
});

React.render(
    <TaxEstimator />, 
    document.querySelector('tax-estimator')
);