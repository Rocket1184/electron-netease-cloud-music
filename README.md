# Electron Netease Cloud Music

**UNOFFICAL** client for music.163.com . Powered by [Vue](https://vuejs.org) and [Electron](https://electronjs.org) .

[![build status](https://api.travis-ci.org/Rocket1184/electron-netease-cloud-music.svg?branch=master)](https://travis-ci.org/Rocket1184/electron-netease-cloud-music/builds)
[![dependencies staus](https://david-dm.org/rocket1184/electron-netease-cloud-music/status.svg)](https://david-dm.org/rocket1184/electron-netease-cloud-music)
[![devDependencies staus](https://david-dm.org/rocket1184/electron-netease-cloud-music/dev-status.svg)](https://david-dm.org/rocket1184/electron-netease-cloud-music?type=dev)

## ScreenShots

### Now Playing

![Player](https://user-images.githubusercontent.com/13914967/42136788-64f73da6-7d94-11e8-86b8-683a49a7074d.png)

<details>

<summary>All screenshots</summary>

### 歌单

![Playlists](https://user-images.githubusercontent.com/13914967/42136809-a6cfebf6-7d94-11e8-9eb5-e5740ffb30c4.png)

### 收藏到歌单

![Add to Playlist](https://user-images.githubusercontent.com/13914967/42136909-24ecbe8c-7d96-11e8-87e8-7e3a81d6f718.png)

### 侧栏

![Sidebar](https://user-images.githubusercontent.com/13914967/42136870-9e7943ca-7d95-11e8-8474-b77f045c372f.png)

### 首页

![Index](https://user-images.githubusercontent.com/13914967/42136855-662f877c-7d95-11e8-823d-6a94eac99289.png)

### 搜索音乐

![Search Music](https://user-images.githubusercontent.com/13914967/42136829-e4796932-7d94-11e8-9acd-bc83d317160c.png)

### 搜索专辑

![Search Album](https://user-images.githubusercontent.com/13914967/42136834-09873f1a-7d95-11e8-8d25-d2bb145c4b15.png)

</details>

## Features

- ~~高仿~~ 音乐播放界面
- 用户登录（手机号/邮箱/用户名）
- 每日签到（可同时签到 PC 端和移动端）
- 播放每日歌曲推荐
- 播放收藏/创建的歌单
- 喜欢音乐（加红心）
- 收藏音乐到歌单
- Linux 桌面媒体控制（ MPRIS ）集成

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
<summary>Unfold TODOs</summary>

- [ ] 各种搜索
  - [ ] 单曲
    - [x] 显示结果
    - [ ] 播放搜索到的歌曲
    - [ ] 浏览/发布歌曲评论
  - [ ] 歌手
    - [x] 显示结果
    - [ ] 歌手页面
  - [ ] 专辑
    - [x] 显示结果
    - [ ] 专辑详情页面
  - [ ] 歌单
    - [x] 显示结果
    - [ ] 歌单内容页面
    - [ ] 收藏歌单
  - [ ] MV
    - [ ] 显示结果
    - [ ] 播放 MV
  - [ ] 用户
    - [ ] 显示结果
    - [ ] 用户信息页面

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
