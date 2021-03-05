# List Users - Custom Method

1. Define a function to get the list of records
1. Return a promise that resolves with 'data' attribute (e.g axios.get)
1. Provide a prop `itemsListMethod={yourCustomMethod}`
1. Function called as `yourCustomMethod(searchVal, page, pageSize)`

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
            itemsListMethod={this.getUsers}
            columns={cols}
            dataKey="login"
            /* dataKey="id" is the default and that works too, 
            however the get details of user assumes you provide the
            login value
            */

        />
    }

    getUsers = (search, page, pageSize) => {
        /*
        You can implement your own method that returns a promise. You might
        have a requirement for authentication or do a post call for a complex
        case to get a list of items.
        After this, the component calls: promise.then(rsp => internalSave(rsp.data))
        rsp.data should be a list of objects or an object. Check documentation for the
        structure
        */
        var promise = axios.get("https://api.github.com/users")
        return promise
    }
}
```
