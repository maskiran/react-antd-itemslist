# Delete User - Custom Method

Item can be deleted by selecting the check box and clicking the *Delete* button.
If a row action is added, click the delete icon on the row

* Provide a prop `itemDeleteMethod={customDeleteFunction}`
* Function is called with the table row record 


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
            rowActions={["deleteItem"]}
            itemDeleteMethod={this.deleteUser}
        />
    }

    deleteUser = (rowRecord) => {
        var promise = axios.delete('https://api.github.com/users/' + rowRecord.login)
        return promise
    }
}
```