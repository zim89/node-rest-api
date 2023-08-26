FIXME: isAuth

Добавлена доппроверка на `!token`

```javascript
if (bearer !== 'Bearer' || !token) {
  next(HttpError(401));
}
```

FIXME: contacts.service -> findOne

доппроверка, что текущий пользователь обращается не просто по айди к контакту, а и то что данный контакт еще и был
созданн именно этим пользователем.

Проблема: если залогиненный пользователь отправит запрос с айди контакта другого пользователя, то получит к нему доступ

было: `if (!data) throw HttpError(404, 'Not found');`

Стало: `if (!data || data.owner._id !== req.user._id) throw HttpError(404, 'Not found');`

а вот в методе update (updateFavorite, remove) - нужно ли дополнительно делать запрос на findOne и проверять, что
текущий пользователь перед обновлением (удалением) планирует проводить действия имеено с контактом, который он же и
создал?

FIXME: findAll by Favorite

сделал условие ,если приходит квери фаворите, то далай один запрос, если нет то другой. Надеюсь это более менее
оптимальный код

```javascript
const findAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite = false } = req.query;
  const skip = (page - 1) * limit;

  const data = favorite
    ? await Contact.find({ owner, favorite }, '-createdAt -updatedAt', { skip, limit }).populate('owner', 'email')
    : await Contact.find({ owner }, '-createdAt -updatedAt', { skip, limit }).populate('owner', 'email');
  res.json(data);
};
```
