# Examples

All the examples use the URL `https://api.github.com/users` and `https://api.github.com/search/users`. Response of the API looks similar to the following with some sample data shown here.

The example code can be copied to **App.js** created via *create-react-app*

```json
[
    {
        "login": "user1",
        "id": 1,
        "html_url": "https://github.com/user1"
    },
    {
        "login": "user2",
        "id": 2,
        "html_url": "https://github.com/user1"
    }
]
```

id and login are the unique fields. Most of the github apis require login name in the api requests. So `login` will be used as the key and not the id

## Example Project

```
npx create-react-app test-items-list
cd test-items-list
npm install antd react-router-dom react-antd-itemslist
npm start
```

Replace the example content shown in the example into `src/App.js` in the above directory. The browser autoreloads

Here is the list of examples provided in this document

1. [List Users](list_users.md)
1. [List Users - Custom Method](list_users_custom_method.md)
1. [List Users - Custom Process Response](list_users_process_data.md)
1. [List Users - Enable Click for details](list_users_click_for_details.md)
1. [List Users - Show delete at row](list_users_show_delete_at_row.md)
1. [List Users - Default Pagination Handler](list_users_default_pagination_handler.md)
1. [List Users - Default Search Handler](list_users_default_search_handler.md)
1. [List Users - Custom Search Handler](list_users_custom_search_handler.md)
1. [List Users - Custom Pagination Handler](list_users_custom_pagination_handler.md)
1. [User Details](user_details.md)
1. [User Details - Custom Method](user_details_custom_method.md)
1. [User Details - Render](user_details_render.md)
1. [Delete User](delete_user.md)
1. [Delete User - Custom Method](delete_user_custom_method.md)
1. [Add User](add_user.md)
1. [Add User - Custom Method](add_user_custom_method.md)