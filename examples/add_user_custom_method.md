# Add / Edit User - Custom Method

Look at the [Add User](add_user.md) for the requirements for the editor component

* Provide a custom add function with prop `itemAddMethod={customAddFunction}`
* Function is called as `customAddFunction(formValuesObject)`. It must return a promise.

```js
import React from 'react'
import ItemsList from 'react-antd-itemslist'
import 'antd/dist/antd.css'
import axios from 'axios'
import {Form, Input} from 'antd'

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

const UserEditor = (props) => {
    return <Form layout="vertical" onFinish={props.onSubmit} name="editor-form">
        <Form.Item label="Username (Login)" name="login">
            <Input placeholder="username"/>
        </Form.Item>
        <Form.Item label="Email Address" name="email">
            <Input placeholder="someone@somewhere.com"/>
        </Form.Item>
    </Form>
}

export default class App extends React.Component {
    render() {
        return <ItemsList
            itemsListUrl="https://api.github.com/users"
            columns={cols}
            dataKey="login"
            indexColViewLink
            editor={UserEditor}
            itemAddMethod={this.addUser}
        />
    }

    addUser = (values) => {
        return axios.post('https://api.github.com/users', values)
    }
}
```