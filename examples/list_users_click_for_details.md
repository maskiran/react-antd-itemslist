# Users Table - Make 'login' field clickable to get the details of the user

This example stops at enabling the field clickable. Next examples show how to get the details of the user record

* To make a column field clickable: add a field `viewItemLink: true` to the column definition
* To make index column clickable: provide a prop `indexColViewLink={true}` to the component

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'

const cols = [
    {
        title: 'Login',
        dataIndex: 'login',
        viewItemLink: true //make login field clickable to get the details of the user
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
        />
    }
}
```

## Make the index col (serial number) clickable to get the details

```js
return <ItemsList
    itemsListUrl="https://api.github.com/users"
    columns={cols}
    dataKey="login"
    indexColViewLink
/>
```