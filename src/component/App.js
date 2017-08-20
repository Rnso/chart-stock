import React, { Component } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as constants from '../../constant.js'
import { API_KEY_GEOCODE, API_KEY_PLACE } from '../../config.js'
import axios from 'axios'
import '../app.css'

class App extends Component {
    constructor() {
        super()
        this.state = {}
        this.state.shownostockmessage = false
        this.state.showerrormessage = false
        this.state.stocks = []
        this.state.stockdata = []
        this.handleAddStock = this.handleAddStock.bind(this)
        this.getStockData = this.getStockData.bind(this)
        this.handleRemoveStock = this.handleRemoveStock.bind(this)
    }
    handleAddStock(e) {
        e.preventDefault()
        let code = (this.refs.stock.value).toUpperCase()
        axios.get(`https://sandbox.tradier.com/v1/markets/lookup?q=${code}`, { headers: { authorization: 'Bearer 8lZWzFwNzsaQY4ZAmDHMBB8SK1t3' }, responseType: 'json' })
            .then(res => {
                //console.log(res.data)
                let obj = {}
                if (res.data.securities == null) {
                    this.setState({ shownostockmessage: true })
                }
                else {
                    this.setState({ shownostockmessage: false })
                    if (Object.prototype.toString.call(res.data.securities.security) === '[object Array]') {                       
                        obj.name = `${res.data.securities.security[0].description} (${code})`
                        obj.code = code
                    }
                    else {
                        obj.name = `${res.data.securities.security.description} (${code})`
                        obj.code = code
                    }
                    let exist = this.state.stocks.filter(stock => {
                        return (stock.name === obj.name && stock.code === obj.code)
                    })
                    //console.log(exist)
                    if (exist.length == 0) {
                        this.state.stocks.push(obj)
                        this.setState({ showerrormessage: false })
                        this.getStockData()
                    }
                    else {
                        this.setState({ showerrormessage: true })
                    }
                }
            })
            .catch(console.error)
    }
    getStockData() {
        if (this.state.stocks.length != 0) {
            this.state.stockdata = []
            let promises = []
            this.state.stocks.map((item, i) => {
                promises.push(axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${item.code}&apikey=8RFZLXMVZ5D9UITC`))
            })
            axios.all(promises).then(res => {
                res.forEach((res, j) => {
                    let index = 0
                    let code = res.data['Meta Data']['2. Symbol']
                    //console.log(code)
                    for (var prop in res.data['Time Series (Daily)']) {
                        if (j == 0) {
                            let obj = {}
                            obj.name = prop
                            obj[`${code}`] = parseFloat(res.data['Time Series (Daily)'][prop]['4. close'])
                            this.state.stockdata.push(obj)
                        }
                        else {
                            this.state.stockdata[index][`${code}`] = parseFloat(res.data['Time Series (Daily)'][prop]['4. close'])
                            index++
                        }
                    }
                })
                //console.log(this.state.stockdata)
                this.setState(this.state.stockdata)
                this.setState(this.state.stocks)
            })
                .catch(console.error)

        }
    }
    handleRemoveStock(e) {
        let i = e.target.id
        this.state.stocks.splice(i, 1)
        this.setState(this.state.stocks)
        this.getStockData()
    }
    render() {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#8884d8', '#FF1493','#008000', '#FFFF00', '#FF0000','#800080','#F5DEB3']
        return (
            <div className='container-fluid'><br/>
                {this.state.stockdata.length != 0 ?
                    <ResponsiveContainer width="100%" height={400}>
                    <LineChart  data={this.state.stockdata}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" domain={['dataMin', 'dataMax']} />
                        <YAxis type="number" domain={['dataMin-100', 'dataMax + 100']} />
                        <CartesianGrid strokeDasharray="1 1" vertical={false} />
                        {this.state.stocks.map((item, i) => {
                            return <Line key={i} type="monotone" dataKey={item.code} stroke={COLORS[i % COLORS.length]} dot={false} />
                        })}
                        <Tooltip />
                        <Legend legendType="rect" verticalAlign="top" />
                    </LineChart>
                    </ResponsiveContainer> : ''}
                <div className='container text-center'>
                    <h3>Add a Stock to compare</h3>
                    <form className="input-group" onSubmit={this.handleAddStock}>
                        <input ref="stock" className="form-control" placeholder="Enter the stock code" />
                        <div className="input-group-btn">
                            <button type='submit' className='btn btn-success' >Add</button>
                        </div>
                    </form><br />
                    {this.state.shownostockmessage ? <div className='alert alert-danger'>the stock symbol does not exist, try again</div> : ''}
                    {this.state.showerrormessage ? <div className='alert alert-danger'>the stock is already added</div> : ''}
                    <br /><br />
                    {this.state.stocks.map((item, i) => {
                        return <div key={i} className='col-md-4'>
                            <div className='stock'>
                                <button id={i} className="close" onClick={this.handleRemoveStock}>&times;</button><br />
                                <h4>{item.name}</h4><hr />
                                <p> Daily close price of the equity specified, updated realtime</p>
                            </div><br />
                        </div>
                    })}
                </div>
            </div>
        )
    }
}
export default App