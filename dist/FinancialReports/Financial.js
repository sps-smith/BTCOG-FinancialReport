
var store = new Vuex.Store({
    state:{
      _years: [2014,2015,2016,2017, 2018, 2019, 2020],
      _months: ['','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      _selectedPeriod: ""
    },
    getters: {
        getMonths: function(state){
            return state._months;
        },
        getYears: function(state){
            return state._years;
        },
        getPeriod: function(state){
            return state._selectedPeriod;
        }
    },
    mutations:{
        setPeriod: function(state, payload){
            state._selectedPeriod = payload;
        }
    },
    actions: {
        GetFinanceData: function(context, payload){
          context.commit("setPeriod", context.state._months[payload.parm] + " " + payload.parm1);
          axios.get(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('Expense Transactions')/items?$filter=Year eq " + payload.parm1 + " and Month eq " + payload.parm, {
            headers: { "accept": "application/json;odata=verbose" }
          })

        }
    }
})


function getFinanceDate(mn, yr){
    var fdate = "01/" + mm + "/" + yr;
}
