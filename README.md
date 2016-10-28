# Tax Estimator
A javascript widget for a rough estimate of city taxes that can be embedded into websites and CMS systems.

## Configuration
Set up taxes in "rates.js" as 2 objects: ResidentialTaxRates and BusinessTaxRates. Each one should have two properties: *main* and *optional*.

### main
main is an object that contains all the main tax rates of the city. The property key will be used as the name of the rate.

``main: {
    "City of Victoria municipal taxes, including VicPD": 13.0546 ,
    "School District": 5.4,
    "Capital Regional District": 0.9254,
    "Capital Regional Hospital District" : 0.7146,
    "BC Assessment": 0.1575,
    "Municipal Finance Authority": 0.0005,
    "BC Transit": 1.2120  
}``

### optional
These taxes depend on a property's specific circumstances. The user can add or remove these rates based on his property.

``optional: {
    "DVBA, Hotel": 0.00032*1000,
    "DVBA, Non-Hotel": 0.00064*1000
}``

## Install
On your web page where you want the tax estimator, load the two scripts: rates.js then tax-estimator.js. Make sure you load rates.js first.

``<script type="text/javascript" src="./rates.js"></script> <script type="text/javascript" src="./tax-estimator.js"></script>``

## Build
Install the dependencies

``npm install``

then run gulp

``gulp``

