# User Details - Custom Method

* Provide a prop: `itemGetMethod={customFunction}`. The function is called with the table row record
* The function must return a promise that should resolve with 'data' attribute

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import axios from 'axios'

const cols = [
    {
        title: 'Login',
        dataIndex: 'login',
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
            columns={cols}
            dataKey="login"
            indexColViewLink
            itemGetMethod={this.getUserDetails}
        />
    }

    getUserDetails = (rowRecord) => {
        var promise = axios.get("https://api.github.com/users/" + rowRecord.login)
        return promise
        // component call promise.then(rsp => internalSaveDetails(rsp.data))
    }
}
```
