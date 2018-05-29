/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

//                              Completed Button on Cards
////////////////////////////////////////////////////////////////////////////////////////

function mark_card_completed(t){
  var card_id = t.getContext()['card'];
  t.board('all')
    .then(resulting_board => get_completed_field_id_from_baord(resulting_board))
    .then(field_id => set_end_date_to_current_date(card_id, field_id));
  
  let board_id = t.getContext()['board'];
  get_done_list_id(board_id)
  .then((list_id) => move_card_to_done(card_id, list_id));
}

function move_card_to_done(card_id, list_id){
  let url = "https://api.trello.com/1/cards/" + card_id + "?idList=" + list_id;
  url = addAuthToken(url);
  fetch(url, {method: 'PUT', headers: {'content-type': 'application/json'}})
}

function get_completed_field_id_from_baord(board){
  for(var i = 0 ; i < board["customFields"].length; i++){
      if(board["customFields"][i].name == "Date Completed"){
        var date_completed_field_id = board["customFields"][i].id;
      }   
    }
  return date_completed_field_id;
}

function set_end_date_to_current_date(card_id, custom_field){
  let cur_date = new Date();
  var url = "https://api.trello.com/1/cards/"+card_id+"/customField/"+custom_field+"/item?";
  url = addAuthToken(url);
  var data = {value: { date: cur_date }};
  fetch(url, { body: JSON.stringify(data), method: 'PUT', headers: {'content-type': 'application/json'}})
  .then((resp) => resp.json())
  // .then((data) => console.log(JSON.stringify(data, null, 2)))
  .catch((err) => console.log("Updating the 'Date Completed' field on this card failed. Make sure the custom field exists on the board.", JSON.stringify(err, null, 2)))
}

function get_done_list_id(board_id){
  let url = "https://api.trello.com/1/boards/" + board_id + "/lists?";
  url = addAuthToken(url);
  return fetch(url, {method: 'GET', headers: {'content-type': 'application/json'}})
  .then((resp) => resp.json())
  .then((lists) => extract_list_id(lists))
}

function extract_list_id(lists_on_board){
  for(let list of lists_on_board){
    if(list.name == "Done") return list.id;
  }
}

function addAuthToken(str){
  return str + "&key=ebc310e38e2e0fe0d33cc0eba8eeb024&token=bcb740e1385d254f27f4c99346788dc13536c86da93a946cf6ecb6234a258608";
}

TrelloPowerUp.initialize({
  'card-buttons': function(t, options){
    return [{
      icon: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
      text: 'Mark Completed',
      callback: mark_card_completed,
    }];
  },
});