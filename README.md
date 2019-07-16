# Electron Netease Cloud Music

**UNOFFICIAL** client for music.163.com . Powered by [Electron](https://electronjs.org), [Vue](https://vuejs.org), and [Muse-UI](https://muse-ui.org).

[![build status](https://api.travis-ci.org/Rocket1184/electron-netease-cloud-music.svg?branch=master)](https://travis-ci.org/Rocket1184/electron-netease-cloud-music/builds)
[![dependencies staus](https://david-dm.org/rocket1184/electron-netease-cloud-music/status.svg)](https://david-dm.org/rocket1184/electron-netease-cloud-music)
[![devDependencies staus](https://david-dm.org/rocket1184/electron-netease-cloud-music/dev-status.svg)](https://david-dm.org/rocket1184/electron-netease-cloud-music?type=dev)

## ScreenShots

### Now Playing

![Player](https://user-images.githubusercontent.com/13914967/52464615-8cee9900-2bb6-11e9-8aa3-a74d8cf7bea5.png)

<details>

<summary>All screenshots</summary>

### 首页

![Index](https://user-images.githubusercontent.com/13914967/52464576-629cdb80-2bb6-11e9-8caa-68975db3ddc3.png)

### 私人 FM

![Radio](https://user-images.githubusercontent.com/13914967/52464706-e656c800-2bb6-11e9-8aad-dd1a92b3f132.png)

### 每日歌曲推荐

![RecommendSongs](https://user-images.githubusercontent.com/13914967/52464628-9aa41e80-2bb6-11e9-9da2-17ca364a35a7.png)

### 我的收藏（歌单、专辑、歌手、视频）

![Favirote Playlist](https://user-images.githubusercontent.com/13914967/52467459-967cfe80-2bc0-11e9-8ab2-a44cee5d163a.png)

![Favorite Artist](https://user-images.githubusercontent.com/13914967/52467487-ad235580-2bc0-11e9-95b2-beaf97728e6d.png)

![Favorite Video](https://user-images.githubusercontent.com/13914967/52467495-b3b1cd00-2bc0-11e9-83ca-f06bbb7c22cb.png)

### 搜索

![Search Album](https://user-images.githubusercontent.com/13914967/52467752-916c7f00-2bc1-11e9-8d7f-524e81481402.png)

### 应用设置

![Settings](https://user-images.githubusercontent.com/13914967/52468251-1e640800-2bc3-11e9-9c60-b342f6ae4010.png)

### 自定义色调 & 暗色主题

![Dark Settings](https://user-images.githubusercontent.com/13914967/52464866-739a1c80-2bb7-11e9-8e19-41a00fa9b857.png)

![Dark Player](https://user-images.githubusercontent.com/13914967/52467317-0f2f8b00-2bc0-11e9-9c01-39a471e97803.png)

![Dark Album Detail](https://user-images.githubusercontent.com/13914967/52467878-e7d9bd80-2bc1-11e9-9d62-59347999eeb1.png)

</details>

## Features

- ~~高仿~~ 音乐播放界面
- 登录（手机号码/邮箱）
- 签到（可同时签到桌面端和移动端）
- 每日歌曲推荐
- 私人 FM （保留历史记录）
- 推荐 歌单/最新音乐
- 播放 歌单/专辑/主播电台
- 喜欢音乐（加红心）
- 收藏音乐到歌单
- 播放/下载 MV/视频
- 搜索 单曲/歌单/专辑/视频
- 收藏/取消收藏 歌单/专辑/歌手/视频/MV/电台
- 创建/回复/点赞/删除 评论
- Linux 桌面媒体控制（ MPRIS ）集成
- 自定义主题颜色，可选全局暗色主题

其他~~鸽了~~计划中的功能请移步 [TODOs](#todos)

## Installation

### Arch Linux

[electron-netease-cloud-music<sup>AUR</sup>](https://aur.archlinux.org/packages/electron-netease-cloud-music/) is avalible in AUR now!

Clone the repo

```sh
git clone https://aur.archlinux.org/electron-netease-cloud-music.git
```

or install with your favorite AUR helper

```sh
yay -S electron-netease-cloud-music
```

### Other GNU/Linux distro or macOS

Download prebuilt binary packages (include bundled electron) there -> [![hreoku status](https://heroku-badge.herokuapp.com/?app=ncm-releases&style=flat&svg=1)](https://ncm-releases.herokuapp.com/)

### asar archive without electron

Install electron with `npm` or your distro's package manager first.

Jump to [release page](https://ncm-releases.herokuapp.com/) and download `asar` package, then run with

```sh
electron /path/to/electron-netease-cloud-music_*.asar
```

## TODOs

<details>
<summary>All TODOs</summary>

- [ ] 各种搜索
  - [x] 单曲
    - [x] 显示结果
    - [x] 插入播放列表
    - [x] 双击立即播放
  - [x] 歌手
    - [x] 显示结果
    - [x] 歌手页面
  - [x] 专辑
    - [x] 显示结果
    - [x] 专辑详情页面
  - [x] 歌单
    - [x] 显示结果
    - [x] 歌单内容页面
  - [x] MV
    - [x] 显示结果
    - [x] MV 页面
    - [x] 播放
    - [x] 下载（真的有人会下载网易云的带水印 MV 吗）
  - [ ] 用户
    - [ ] 显示结果
    - [ ] 用户信息页面
  - [ ] 主播电台
    - [ ] 显示结果
    - [x] 电台详情页面
- [x] 每日歌曲推荐
  - [x] 播放
  - [x] 不感兴趣
- [ ] 其他推荐资源
  - [x] 推荐歌单
  - [ ] ~~推荐 MV~~ （推荐的都是辣鸡资源，不要了）
  - [x] 最新音乐
  - [ ] 标记为不感兴趣
- [x] 私人 FM
  - [x] 获取 FM
  - [x] 不喜欢
- [ ] 歌单编辑
  - [ ] 创建歌单
  - [ ] 修改简介
  - [ ] 删除歌曲
  - [ ] 歌曲排序 （这个网页端似乎做不到）
- [x] 各种评论的读写
  - [x] 单曲
  - [x] 歌单
  - [x] 专辑
  - [x] 视频/MV
  - [x] 电台节目
- [x] 各种已收藏的资源的读写
  - [x] 歌单
  - [x] 歌手
  - [x] 专辑
  - [x] 视频/MV
  - [x] 主播电台
- [ ] 私信读写 （真的有人用一个音乐 App 来聊天吗）
- [ ] 通知消息 （私信，评论， @ 等）
- [ ] 各种榜单 （反正我不用，鸽了鸽了）
- [ ] 首页 Banner （哈？这是广告吧）
- [ ] 朋友动态 （嗯 ... 我觉得不太行）

</details>

## Development & Build

``` bash
# install dependencies
yarn

# serve with hot reload at http://localhost:24353
yarn dev

# bundle JavaScript and CSS
yarn dist

# package the app
yarn build linux
yarn build darwin
```

## Acknowledgement

- [darknessomi/musicbox/wiki](https://github.com/darknessomi/musicbox/wiki)
- [metowolf/NeteaseCloudMusicApi/wiki](https://github.com/metowolf/NeteaseCloudMusicApi/wiki)
- [Copay/cloudmusicapi](https://github.com/Copay/cloudmusicapi)
- [Binaryify/NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi)
- [nondanee/Glee](https://github.com/nondanee/Glee)
- [JixunMoe/netease-cloud-music-api](https://github.com/JixunMoe/netease-cloud-music-api)
- [surmon-china/simple-netease-cloud-music](https://github.com/surmon-china/simple-netease-cloud-music)
