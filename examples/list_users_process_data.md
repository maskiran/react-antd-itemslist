# List Users with custom handler of the returned data

1. Provide a prop `reformatListMethod=this.processDataFunction`  that returns a list of objects with keys

The component calls `axios.get(itemsListUrl)` to get the data

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'

const cols = [
    {
        title: 'Login',
        dataIndex: 'login'
    },
    {
        title: 'HTML URL',
        dataIndex: 'html_url'
    }
]

export default class App extends React.Component {
    render() {
        return <ItemsList
            itemsListUrl="https://api.github.com/users"
            reformatListDataMethod={this.processList}
            columns={cols}
            dataKey="login"
            /* dataKey="id" is the default and that works too, 
            however the get details of user assumes you provide the
            login value
            */
        />
    }

    processList = (rspData, rspHeaders) => {
        console.log(rspHeaders)
        console.log(rspData)
        // process data, headers by adding more info, processing etc
        // or save data here for any other info
        return {items: rspData, count: rspData.length}
    }
}
```