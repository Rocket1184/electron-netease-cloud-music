export const Entries = [
    {
        name: '主题',
        items: [
            {
                type: 'color',
                title: '主题色',
                prop: 'themePrimaryColor'
            },
            {
                type: 'color',
                title: '强调色',
                prop: 'themeSecondaryColor'
            },
            {
                type: 'select',
                title: '背景色',
                prop: 'themeVariety',
                options: [
                    { label: '亮色', value: 'light' },
                    { label: '暗色', value: 'dark' }
                ]
            }
        ]
    },
    {
        name: '行为',
        items: [
            {
                type: 'select',
                title: '界面缩放',
                prop: 'windowZoom',
                options: [
                    { label: '跟随系统', value: null },
                    { label: '1x', value: 1 },
                    { label: '1.25x', value: 1.25 },
                    { label: '1.5x', value: 1.5 },
                    { label: '1.75x', value: 1.75 },
                    { label: '2x', value: 2 },
                    { label: '2.5x', value: 2.5 },
                    { label: '3x', value: 3 }
                ]
            },
            {
                type: 'toggle',
                title: '使用系统标题栏',
                prop: 'windowBorder'
            },
            {
                type: 'toggle',
                title: '显示托盘图标',
                prop: 'showTrayIcon'
            },
            {
                type: 'toggle',
                title: '启动时最小化到托盘',
                prop: 'minimizeOnStartup',
                depends: ['showTrayIcon']
            },
            {
                type: 'select',
                title: '托盘图标颜色',
                prop: 'trayIconVariety',
                options: [
                    { label: '亮色', value: 'light' },
                    { label: '暗色', value: 'dark' }
                ],
                exclude: ['isDarwin'],
                depends: ['showTrayIcon']
            },
            {
                type: 'select',
                title: '关闭窗口时',
                prop: 'exitOnWindowClose',
                options: [
                    { label: '退出程序', value: true },
                    { label: '最小化到托盘', value: false }
                ],
                exclude: ['isDarwin'],
                depends: ['showTrayIcon']
            }
        ]
    },
    {
        name: '播放',
        items: [
            {
                type: 'select',
                title: '播放码率',
                prop: 'bitRate',
                options: [
                    { label: '无损 (FLAC)', value: 'ex' },
                    { label: '极高 (320 kbit/s)', value: 'h' },
                    { label: '较高 (192 kbit/s)', value: 'm' },
                    { label: '标准 (128 kbit/s)', value: 'l' },
                ]
            },
            {
                type: 'select',
                title: '下载码率',
                prop: 'bitRateDownload',
                options: [
                    { label: '无损 (FLAC)', value: 'ex' },
                    { label: '极高 (320 kbit/s)', value: 'h' },
                    { label: '较高 (192 kbit/s)', value: 'm' },
                    { label: '标准 (128 kbit/s)', value: 'l' },
                ]
            },
            {
                type: 'toggle',
                title: '启动时自动开始播放',
                prop: 'autoPlay'
            },
            {
                type: 'toggle',
                title: '自动替换播放列表为当前歌单',
                prop: 'autoReplacePlaylist'
            }
        ]
    },
    {
        name: '特性',
        items: [
            {
                type: 'toggle',
                title: '自动签到',
                prop: 'autoSign'
            },
            {
                type: 'toggle',
                title: '精简个性推荐',
                prop: 'filterRcmd'
            },
            {
                type: 'select',
                title: '启动页面',
                prop: 'startupPage',
                options: [
                    { label: '个性推荐', value: 'index' },
                    { label: '搜索结果', value: 'search' },
                    { label: '我的收藏', value: 'favorite' },
                    { label: '音乐云盘', value: 'disk' },
                    { label: '私人 FM', value: 'radio' },
                    { label: '每日推荐', value: 'recommend' },
                    { label: '应用设置', value: 'settings' },
                ]
            }
        ]
    },
    {
        name: '存储',
        items: [
            {
                type: 'plain',
                title: '浏览器缓存',
                data: 'cacheSize',
                handler: 'promptClearBrowserCache'
            },
            {
                type: 'plain',
                title: '歌曲缓存',
                data: 'musicSize',
                handler: 'promptClearMusicCache'
            },
            {
                type: 'plain',
                title: '所有应用数据',
                data: 'dataSize',
                handler: 'promptWipeAppData'
            }
        ]
    },
    {
        name: '调试',
        items: [
            {
                type: 'plain',
                title: '启动开发者工具',
                handler: 'launchDevTools'
            },
            {
                type: 'plain',
                title: '重新载入页面',
                handler: 'reloadPage'
            },
            {
                type: 'plain',
                title: '重新创建窗口',
                handler: 'recreateWindow'
            }
        ]
    },
    {
        name: '关于',
        items: [
            {
                type: 'plain',
                title: '版本号',
                data: 'versionName',
                handler: 'showVersions'
            },
            {
                type: 'plain',
                title: '获取源代码',
                handler: 'openRepoInBrowser'
            }
        ]
    }
];
