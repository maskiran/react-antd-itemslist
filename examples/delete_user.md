# Delete User

Item can be deleted by selecting the check box and clicking the *Delete* button.
If a row action is added, click the delete icon on the row

* Provide a prop `itemBaseUrl`. Component suffixes the `row[dataKey]` to the url and calls `axios.delete(newUrl)`


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
            indexColViewLink
            itemBaseUrl="https://api.github.com/users"
            rowActions={["deleteItem"]}
        />
    }
}
```