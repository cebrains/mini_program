import { fetchType } from './config';
//获取应用实例
var app = getApp();

export const handleDialogueSucCb = (data) => {
    app.requestTalkId = data.id;
    let { talk } = data,
        _data = talk || data,
        { contents, asking, actions } = _data,
        _list = {
            id: data.id || '',
            sn: _data.sn
        },
        _asking = {},
        _options = [],
        _action = [],
        _optType,
        age, gender, _diseases,
        _recall = {
            recall: {},
            isRecall: false
        }, _askName;

    if (asking && JSON.stringify(asking) != '{}') {
        _asking.type = asking['@type'];

        _optType = setType(asking['@type']);
        _list.optType = _optType;

        if (asking.text) {
            _list[_list.length - 1].text = asking.text;
        }

        if (asking.options && asking.options.length > 0) {
            _asking.options = asking.options;
            _options = asking.options;
        }

        if (asking.watermark) {
            _asking.watermark = asking.watermark;
        }
  
        if (_optType == 'AskSymptoms') {
            age = asking.age.year;
            gender = asking.gender;
        }

        // 保存结果
        if (_optType == 'SaveOptions') {
            let options = [
                { key: 'save', text: '保存问诊结果' },
                { key: 'noSave', text: '不保存' },
            ]

            _asking.options=options;
            _options=options,
            _askName=asking.askName
        }

        _list.asking = _asking;
    }

    if (contents && contents.length > 0) {
        let len = _data.contents.length,
            stems = [];

        contents.map((val, idx) => {
            let _optType = setType(val['@type']);
            let json = {
                type: _optType,
                stem: val.text || ''
            };

            if (_optType =='Image'){
                json.stem=val.image
            }

            // 诊断结果
            if (_optType == 'Diagnosis') {
                if (val.items && val.items.length > 0) {    //有诊断结果

                    let arr=val.items.map(value=>{
                        let obj={
                            id: value.disease.id || '',
                            name: value.disease.name || '',
                            weight: (value.weight*100).toFixed(1) || '',
                            describe: value.wikiAbstract || '',
                        }
                        if(value.department){
                            obj.departmentId=value.department.id || '';
                            obj.departmentName = value.department.text || '';
                        }
                        
                        if (value.drugPlans && value.drugPlans.length>0 ){
                            obj.drugPlans = value.drugPlans
                        }else{
                            obj.drugPlans=[];
                        }

                        return obj;
                    })
                    
                    json.disease=arr[0];

                    _diseases = arr;
                    json.hasDiagnose = true;


                } else {        //没有诊断结果
                    json.stem = val.suggestion ? (val.suggestion.text ? val.suggestion.text : '') : '';
                    json.hasDiagnose = false;
                }

                if (val.recalledItems && val.recalledItems.length > 0 && val.notification) {
                    _recall = {
                        items: val.recalledItems,
                        notification: val.notification,
                        isRecall:true
                    };
                    json.recallInfo = {
                        title: val.notification.title || '',
                        text: val.notification.text || ''
                    };
                    json.isRecall=true;
                }
            }


            // 更多
            if (val.detail) {
                json.action = [{
                    type: 'action',
                    text: '更多',
                    detail: val.detail,
                    commandId: 'more'
                }]
            }
            
            stems.push(json);
            _list.stems = stems;
        })
    }

    if (actions && actions.length > 0) {
        actions.map(val => {
            let json = {
                type: 'action',
                text: val.text,
                commandId: val.command ? (val.command.id ? val.command.id : '') : ''
            }
            _action.push(json);
        })
    }

    if (_optType == 'AskSymptoms') {
        _action.push({
            type: 'action',
            commandId: 'ask-symptoms',
            text: '通过症状列表选择'
        })
    }

    if (_action.length > 0) {
        _list.stems[_list.stems.length - 1].action = _action;
        _list.stems[_list.stems.length - 1].finish = false;      //是否点击过这次对话的acton
    }

    _list.answer = [];

    if (age && gender) {
        return { _list, _options, age, gender };
    }

    let _diseaseResult;
    if (_diseases) {
        _diseaseResult={
            sn: _data.sn,
            diagnosis:_diseases,
            recall: _recall
        }
        return { _list, _options, _diseaseResult, _askName };
    }
    return { _list, _options };
}

function setType(type) {
    let optType = '';
    for (let i = 0; i < fetchType.length; i++) {
        if (type == fetchType[i].req) {
            optType = fetchType[i].type;
            break;
        }
    }
    return optType;
}



export function handleSymptomListFetch(data) {
    let _list = {},
        _sort = ['常见症状', '头部', '咽喉和颈部', '四肢症状', '胸部', '腹部', '腰背部', '泌尿生殖', '臀部及肛门', '皮肤', '全身症状'],
        arr = [];
    data.items.map(function (val, idx) {
        let json = {};
        json.id = val.id;
        json.text = val.name;

        json.choice = false;

        if (val.isCommon) {
            json.commonWeight = val.commonWeight || 0;
            arr.push(json);
        }

        if (_list[val.category]) {
            _list[val.category].push(json);
        } else {
            _list[val.category] = [];
            _list[val.category].push(json);
        }
    })
    _list['常见症状'] = arr.sort(function (a, b) {
        return b.commonWeight - a.commonWeight
    })

    // for(let item in _list){
    //     _sort.push(item)
    // }

    return { _list, _sort };
}

export function handleWiki(data) {
    let json = {
        id: data.id,
        name: data.name,
        items: []
    }
    // { title: '典型症状', describe: '由于感染或非感染因素引起的气管、支气管黏膜炎性变化黏液分泌增多。', show: false },
    data.chapters && data.chapters.length > 0 && data.chapters.map((val, idx) => {
        json.items.push({
            title: val.title,
            describe: val.text,
            show: idx == 0 ? true : false
        })
    })

    return { json }
}

