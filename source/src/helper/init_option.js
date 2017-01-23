function anchorBack() {
    if (history.state && history.state.scrollY) { //支持锚点返回
        if (BCD.history.getCode() == -1) {
            scrollTo(0, history.state.scrollY);
        }
        BCD.extendState({ //保证刷新可回到头部
            scrollY: 0
        });
    }
}

//带锚点返回，不reset子view
function notRender(hasRender) {
    if (hasRender) {
        BCD.getPage().show();
        anchorBack();
        return 'show';
    }
}
module.exports = {
    notRender,
    anchorBack
};
