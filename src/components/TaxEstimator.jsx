var React = require('../vendor/react');

var TaxRow = React.createClass({
    render:function(){
        var amount = (this.props.rate * (this.props.value/1000)).toFixed(2);
        return (
            <tr>
                <td>{this.props.tax}</td>
                <td>{this.props.rate}</td>
                <td>${amount}</td>
            </tr>
        );
    }
});

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
                <th>Total</th>
                <th>{totalRate}</th>
                <th>${amount}</th>
            </tr>
        );
    }
});

var TaxEstimator = React.createClass({
    getInitialState: function(){
        return {
            assessedValue:200000,
            taxRates: {
                "General Tax": 5,
                "Test Tax": 2.4
            }
        };
    },
    handleChange:function(e){
        this.setState({
            assessedValue: e.target.value,
            taxRates: this.state.taxRates
        });
    },
    render:function(){
        return (
            <div>
                <div>
                    <label for="assessedValue">Assessed Value</label>
                    <input id="assessedValue" type="number" value={this.state.assessedValue} onChange={this.handleChange}/>
                </div>
                <section>                    
                    <table>
                        <thead>
                            <tr>
                                <th>Tax</th>
                                <th>Rate</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tfoot>
                            <TaxSum rates={this.state.taxRates} value={this.state.assessedValue} /> 
                        </tfoot>
                        <tbody>
                        {(function(rates, value){
                            return Object.getOwnPropertyNames(rates).map(function(k){
                                return <TaxRow key={k} tax={k} rate={rates[k]} value={value} />;
                            });
                        })(this.state.taxRates, this.state.assessedValue)}
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