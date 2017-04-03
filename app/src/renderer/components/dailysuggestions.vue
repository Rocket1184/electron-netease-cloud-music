<template>
    <mu-paper class="paper">
        <div class="cell title">
            <p>{{dayNumber}}</p>
            <p>每日推荐</p>
        </div>
        <div class="cell content">
            <mu-table>
                <template v-for="song in dailyList">
                    <mu-tr>
                        <mu-td :title="song.name"><span class="label">{{song.name}}</span></mu-td>
                        <mu-td :title="song.artistName"><span class="label">{{song.artistName}}</span></mu-td>
                        <mu-td>
                            <mu-icon-button icon="favorite_border" />
                            <mu-icon-button icon="photo_filter" />
                            <mu-icon-button icon="playlist_add" />
                        </mu-td>
                    </mu-tr>
                </template>
            </mu-table>
        </div>
    </mu-paper>
</template>

<script>
import ApiHost from '../../util/apihost';
export default {
    data() {
        return {
            dailyList: ApiHost.getDailySuggestions()
        };
    },
    computed: {
        dayNumber() {
            return new Date().getDate();
        }
    }
};
</script>

<style lang="less">
.paper {
    display: flex;
    .cell {
        flex-direction: row;
        flex-wrap: nowrap;
    }
    .title {
        flex: 2;
        background-color: indianred;
        text-align: center;
        color: white;
        font-size: 24px;
        padding-top: 4em;
    }
    .content {
        flex: 7;
        .label {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>
