# common

- структура папок проекта?
- как избавиться от длинного айди в строке адреса?
- инструмент для создания слаг поля?
- нюансы со множеством связей

# HW-04

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

# HW-05

```javascript
const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  Jimp.read(tempUpload)
    .then((file) => {
      return file.resize(Jimp.AUTO, 250).quality(60).write(tempUpload);
    })
    .catch((err) => {
      console.error(err);
    });
  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join('avatars', filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};
```

## Проблема

`Jimp` берет загруженный в `temp` файл, оптимизирует его и перезаписывает файл в папке `temp`.

После `await fs.rename(tempUpload, resultUpload)` должен переместить файл из папки `temp` в `public`, но по факту
получаем копию ранее загруженного файла без оптимизации.

В итоге: в папке `temp` лежит оптимизированный файл, а в папке `public` - не оптимизированный.

Почему так получается?????

## Альтернатива

```javascript
const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  Jimp.read(tempUpload)
    .then((file) => {
      return file.resize(Jimp.AUTO, 250).quality(60).write(resultUpload);
    })
    .catch((err) => {
      console.error(err);
    });
  await fs.unlink(tempUpload);

  const avatarURL = path.join('avatars', filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};
```

Сохраняем загруженный файл в папку `temp`, потом `Jimp` берет этот файл, оптимизирует и сохраняет оптимизированный файл
в папку `public`.

Далее `await fs.unlink(tempUpload)` удаляем ранее сохраненный файл из папки `temp`.

Прием ли данный метод?
