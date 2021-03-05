# List Users

1. Provide a `itemsListUrl` that returns a list of objects with keys
1. Provide a fieldname that's a key (default is the 'id')
1. Provide a list of columns to display

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
            columns={cols}
            dataKey="login"
            /* dataKey="id" is the default and that works too, 
            however the get details of user assumes you provide the
            login value
            */
        />
    }
}
```