# List Users - Show Delete at each row

This example stops at showing the delete link at each row. Look at the examples for delete for more details

* Provide a prop `rowActions: {["deleteItem"]}`

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'

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
            rowActions={["deleteItem"]}
        />
    }
}
```