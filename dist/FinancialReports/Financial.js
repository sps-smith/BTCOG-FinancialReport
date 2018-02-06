

var store = new Vuex.Store({
    state:{
      _years: [2014,2015,2016,2017, 2018, 2019, 2020],
      _months: ['','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      _selectedPeriod: "",
      _expenses:[],
      _revenue:[]
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
        },
        setExpenses: function(state, payload){
            state._expenses = payload;
        },
        setRevenue: function (state, payload) {
          state._revenue = payload;
        }
    },
    actions: {
        GetFinanceData: function(context, payload){
          var wrkary = [];
          context.commit("setPeriod", context.state._months[payload.parm] + " " + payload.parm1);
          axios.get(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('Expense Transactions')/items?$select=TransactionType/Title,TransactionDate,Amount&$filter=TransactionDate ge datetime'" + getFinanceStartDate(payload.parm, payload.parm1) + "' and TransactionDate le datetime'" + getFinanceEndDate(payload.parm, payload.parm1) + "'&$expand=TransactionType/Id", {
            headers: { "accept": "application/json;odata=verbose" }
          })
          .then(function(results){
              results.data.d.results.forEach(function(element){
                  var fnd = wrkary.filter(function(item){
                      return item.Expense == element.TransactionType.Title;
                  });
                  if (fnd.length == 0)
                  {
                      var dt = {
                          Expense: element.TransactionType.Title,
                          Period:[0,0,0,0,0]
                      }

                      dt.Period[getPeriodDay(element.TransactionDate)-1] = element.Amount;
                      wrkary.push(dt)
                  }
                  else
                  {
                      $.each(wrkary, function(idx, item){
                          if (item.Expense == fnd[0].Expense)
                          {
                              item.Period[getPeriodDay(element.TransactionDate) - 1] += element.Amount;
                              return false;
                          }
                      })
                  }
              });
              context.commit("setExpenses", wrkary);
          })
          .then(function(data){
              axios.get(_spPageContextInfo.webServerRelativeUrl + "/_api/web/lists/getbytitle('Revenue Transactions')/items?$select=TransactionType/Title,TransactionDate,Amount&$filter=TransactionDate ge datetime'" + getFinanceStartDate(payload.parm, payload.parm1) + "' and TransactionDate le datetime'" + getFinanceEndDate(payload.parm, payload.parm1) + "'&$expand=TransactionType/Id", {
                headers: { "accept": "application/json;odata=verbose" }
              })
              .then(function(results){
                  wrkary = [];
                  results.data.d.results.forEach(function (element) {
                      var fnd = wrkary.filter(function (item) {
                        return item.Revenue == element.TransactionType.Title;
                      });
                      if (fnd.length == 0) {
                        var dt = {
                          Revenue: element.TransactionType.Title,
                          Period: [0, 0, 0, 0, 0]
                        }

                        dt.Period[getPeriodDay(element.TransactionDate) - 1] = element.Amount;
                        wrkary.push(dt)
                      }
                      else {
                        $.each(wrkary, function (idx, item) {
                          if (item.Revenue == fnd[0].Revenue) {
                            item.Period[getPeriodDay(element.TransactionDate) - 1] += element.Amount;
                            return false;
                          }
                        })
                      }
                  });
                  context.commit("setRevenue", wrkary);
              })
          })

        }
    }
})

function getPeriodDay(dte){
    var dy = new Date(dte).getDate()
    if (dy <= 7)
      return 1;
    else
    {
        var nm = Math.round(dy / 7);
        var rm = dy % 7;
        if (rm > 0)
          nm += 1;
        return nm
    }
}

function getFinanceStartDate(mn, yr){
    var fdate = mn + "/01/" + yr;
  return new Date(fdate).toISOString().substring(0, 10) + "T00:00:00";
}

function getFinanceEndDate(mn, yr) {
    var edate = Date.getDaysInMonth(yr, mn)
  return new Date(mn + "/" + edate + "/" + yr).toISOString().substring(0, 10) + "T00:00:00";
}
