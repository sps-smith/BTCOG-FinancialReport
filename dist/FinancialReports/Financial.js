

var store = new Vuex.Store({
    state:{
      //_years: [2014,2015,2016,2017, 2018, 2019, 2020],
      _months: ['','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      _selectedPeriod: "",
      _selectedMonth:0,
      _expenses:[],
      _revenue:[],
      _weeks:5,
      _days:0
    },
    getters: {
        getMonths: function(state){
            return state._months;
        },
        getYears: function(state){
            var dt = new Date().getFullYear();
            var data  = [];
            data.push(dt);
            for(var x=1; x <=4;x++){
                data.push(dt - x);
            }
            return data;
        },
        getPeriod: function(state){
            return state._selectedPeriod;
        },
        getRevenue: function(state){
          var data = [], revAry = [],  dt = {};
            state._revenue.forEach(function(item){
                data = [];
                item.Period.forEach(function(dta){
                    data.push(dta);
                })

                dt = {
                    Title: item.Revenue,
                    week1: data[0],
                    week2: data[1],
                    week3: data[2],
                    week4: data[3],
                    week5: data[4]
                }

                revAry.push(dt)
            })
            return revAry.sort(function(a,b){
                return a.Title > b.Title;
            });
        },
        getExpense: function (state) {
            var data = [], revAry = [],  dt = {};
            state._expenses.forEach(function(item){
                data = [];
                item.Period.forEach(function(dta){
                    data.push(dta);
                })

                dt = {
                    Title: item.Expense,
                    week1: data[0],
                    week2: data[1],
                    week3: data[2],
                    week4: data[3],
                    week5: data[4]
                }

                revAry.push(dt)
            })
            return revAry.sort(function(a,b){
                return a.Title > b.Title;
            });          
        },
        getNetBalances: function(state){
            var rev1 = 0, rev2 = 0, rev3 = 0, rev4 = 0, rev5 = 0;
            var exp1 = 0, exp2 = 0, exp3 = 0, exp4 = 0, exp5 = 0;
            var net1 = 0, net2 = 0, net3 = 0, net4 = 0, net5 = 0;
            state._revenue.forEach(function(item){
                rev1 += item.Period[0];
                rev2 += item.Period[1];
                rev3 += item.Period[2];
                rev4 += item.Period[3]
                rev5 += item.Period[4];
            });
            state._expenses.forEach(function(item){
                //item.Period.forEach(function(dta){
                    exp1 += item.Period[0];
                    exp2 += item.Period[1];
                    exp3 += item.Period[2];
                    exp4 += item.Period[3];
                    exp5 += item.Period[4];
               // })
            });
            net1 = rev1 - exp1;
            net2 =  rev2 -  exp2;
            net3 =   rev3 -  exp3;
            net4 =   rev4 -  exp4;
            net5 =  rev5 -  exp5;
            return [{Title:"Balance", bal1: net1, bal2: net2, bal3: net3, bal4:net4, bal5:net5}];
        }, 
        getSelectedMonth: function(state){
            return state._selectedMonth;
        },
        getWeeks: function(state){
            return state._weeks;
        },
        getDays: function(state){
            return state._days;
        },
        getRevenueLoaded: function(state){
            if (state._revenue.length > 0)
                return false;
            return true;
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
        },
        setSelectedMonth: function(state, payload){
            state._selectedMonth = payload;
        },
        setWeeks: function(state, payload){
            state._weeks = payload;
        },
        setDays: function(state, payload){
            state._days = payload;
        }
    },
    actions: {
        GetFinanceData: function(context, payload){
          var wrkary = [];
          context.commit("setSelectedMonth", payload.parm);
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
                    context.commit("setWeeks", getnumberofweeks(payload.parm1, payload.parm));
                  context.commit("setDays", Date.getDaysInMonth(payload.parm1, payload.parm-1));
              })
          })

        }
    }
})

function getPeriodDay(dte){
    var dy = new Date(dte).getDate()
    if (dy <= 7)
      return 1;

    if (dy > 7 && dy <= 14)
      return 2;

    if (dy > 14 && dy <= 21)
      return 3;

    if (dy > 21 && dy <= 28)
      return 4;

    if (dy > 28)
      return 5;
  }

function getFinanceStartDate(mn, yr){
    var fdate = mn + "/01/" + yr;
  return new Date(fdate).toISOString().substring(0, 10) + "T00:00:00";
}

function getFinanceEndDate(mn, yr) {
    var edate = Date.getDaysInMonth(yr, mn-1)
  return new Date(mn + "/" + edate + "/" + yr).toISOString().substring(0, 10) + "T00:00:00";
}

function getnumberofweeks(payload, payload1) {
  var edate = Date.getDaysInMonth(payload, payload1-1);
  var nm = Math.round(edate / 7);
  var rm = edate % 7;
  if (rm > 0)
    nm += 1;
  return nm;
}
