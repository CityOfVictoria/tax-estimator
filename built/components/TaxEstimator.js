var React = require('../vendor/react');

var TaxRow = React.createClass({displayName: "TaxRow",
    render:function(){
        var amount = (this.props.rate * (this.props.value/1000)).toFixed(2);
        return (
            React.createElement("tr", null, 
                React.createElement("td", null, this.props.tax), 
                React.createElement("td", null, this.props.rate), 
                React.createElement("td", null, "$", amount)
            )
        );
    }
});

var TaxEstimator = React.createClass({displayName: "TaxEstimator",
    getInitialState: function(){
        return {
            assessedValue:200000,
            taxRates: {
                "General Tax": 5
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
            React.createElement("div", null, 
                React.createElement("div", null, 
                    React.createElement("label", {for: "assessedValue"}, "Assessed Value"), 
                    React.createElement("input", {id: "assessedValue", type: "number", value: this.state.assessedValue, onChange: this.handleChange})
                ), 
                React.createElement("section", null, 
                    React.createElement("table", null, 
                        React.createElement("thead", null, 
                            React.createElement("tr", null, 
                                React.createElement("th", null, "Tax"), 
                                React.createElement("th", null, "Rate"), 
                                React.createElement("th", null, "Amount")
                            )
                        ), 
                        React.createElement("tbody", null, 
                        (function(rates, value){
                            return Object.getOwnPropertyNames(rates).map(function(k){
                                return React.createElement(TaxRow, {key: k, tax: k, rate: rates[k], value: value});
                            })
                        })(this.state.taxRates, this.state.assessedValue)
                        )
                    )
                )
            )
        );
    }
});

React.render(
    React.createElement(TaxEstimator, null), 
    document.querySelector('tax-estimator')
);