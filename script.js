$(document).ready(start);

var idNum = 0;
var moreThanNone = false;
var sortBy = "first" // Sort by 'first' name or 'last' name
var contacts = {};
var request = false;

// UI Setup
function start(){
  clickSetup();
  getAllContacts();
}
function clickSetup() {
  $('i.fa.fa-plus.fa-2x').on('click', createNewContactForm);
  $('i.fa.fa-search.fa-2x').on('click', filterContact);
  $("button.form-btn.new").on("click",function(){
    requestAdd();
  });
  $("button.form-btn.cancel").on("click", cancelFormButton);
  $(`button.form-btn.update`).on('click', function(event) {
    requestUpdate($('input[name=contactId]').val());
  });
  $('i.fa.fa-times.fa-3x').on('click', cancelSearch);
  $('div.sort-list span').on('click', toggleSortBy);
}
function cancelFormButton(event){
  clearInputFields();
  $(`div.form`).css('display','none');
  $("div#contacts").css('display', "block");
  getAllContacts();
}
function toggleSortBy(){
  if (sortBy === "first") {
    sortBy = "last";
    $(`div.sort-list span`).html(`first name`);
  } else {
    sortBy = "first"
    $(`div.sort-list span`).html(`last name`);
  }
  showContacts({
    contacts: contacts
  });
}
function sortContacts(sortIndicator, contacts){
  let nameA;
  let nameB;
  // By first name
  if (sortIndicator === "first") {
    contacts.sort(function(a, b) {
      nameA = a.name.first.toUpperCase();
      nameB = b.name.first.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
  // By last name
  if (sortIndicator === "last") {
    contacts.sort(function(a, b) {
      nameA = a.name.last.toUpperCase();
      nameB = b.name.last.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
}
function numberOfContacts(num) {
  $(`.title h1 span`).html(num);
  if (num > 0) {
    moreThanNone = true;
  }
}
function clearInputFields(){
  let $inputElements = $(`div.form input`);
  for (let i = 0; i < $inputElements.length; i++){
    $inputElements[i].value = "";
  }
}

// List Contacts information
function getAllContacts(){
  if (request) {
    return;
  }
  request = true;
  let url = "http://dev.alexshoucri.com:8888/contacts/"
  $.getJSON(url, {
		// Get all contacts
	}, showContacts);
}
function showContacts(data) {
  request = false;
  contacts = data.contacts;
  sortContacts(sortBy, contacts);
  $("#contacts .list").empty();
  let count = contacts.length;
  for (let i = 0; i < contacts.length; i++) {
    let content = $("#contacts .list").append(`
        <tr class="info ${contacts[i].id}">
          <td class="photo" style="height:50px; overflow: hidden"><img src="${contacts[i].photo}" style="width:50px; border-radius:100%;"/></td>
          <td class="person">
            <div id=${contacts[i].id} class="name">${contacts[i].name.first} ${contacts[i].name.last}&nbsp;<i class="fa fa-chevron-down" aria-hidden="true"></i></div>
            <div class="jobTitle">${contacts[i].jobTitle}</div>
          </td>
          <td class="email"><a href="mailto:${contacts[i].email}"><i class="fa fa-envelope-o fa-lg" aria-hidden="true"></i></a></td>
          <td class="edit"><i class="fa fa-pencil fa-lg" aria-hidden="true"></i></td>
          <td class="delete"><i class="fa fa-trash-o fa-lg" aria-hidden="true"></i></td>
        </tr>
      `);
  }
  numberOfContacts(count);

  $("i.fa.fa-pencil.fa-lg").on("click", editContact);
  $("i.fa.fa-trash-o.fa-lg").on("click", confirmDeleteOfContact);
  $("i.fa.fa-chevron-down").on("click", requestFullProfile);
}

// Contact information
function getProfile(id, callback) {
  if (request) {
    return;
  }
  request = true;
  let url = "http://dev.alexshoucri.com:8888/contacts/" + id
  $.getJSON(url, {
	}, callback);
}
function requestFullProfile(event) {
  let contactId = event.target.parentElement.id;
  $(`.info.${contactId} .email`).css("visibility","hidden");
  getProfile(contactId, showProfile);
}
function closeFullProfile(event){
  let divId = event.target.parentElement.id;
  $(`#${divId} i.fa.fa-chevron-up`).remove();
  $(`.full-profile`).remove();
  $('.info').css({
    height: '90px',
    verticalAlign: 'middle'
  })
  $(`#${divId} i.fa.fa-chevron-down`).css("display","inline-block");
  $(`.info.${divId} .email`).css("visibility","visible");
}
function showProfile(data){
  request = false;
  // Show full info of one contact
  $(`tr.info.${data.id}`).css({
    height: 'auto',
    verticalAlign: 'top'
  });
  $(`#${data.id} i.fa.fa-chevron-down`).css("display","none");
  $(`#${data.id}`).append(`<i class="fa fa-chevron-up" aria-hidden="true"></i>`);
  $(`i.fa.fa-chevron-up`).on('click', closeFullProfile);

  let content = `
    <div class='full-profile'>
      <div class='address'>
        <p>
          <i class="fa fa-map-marker" aria-hidden="true"></i> `
  if (data.address.address1) {
    content += `${data.address.address1}<br>`
  }
  if (data.address.address2 === 'string') {
    content += `${data.address.address2}<br>`
  }
  if (data.address.city) {
    content += `${data.address.city}<br>`
  }
  if (data.address.state) {
    content += `${data.address.state}<br>`
  }
  if (data.address.zip) {
    content += `${data.address.zip}<br>`
  }
  content += `
        </p>
      </div>
      <div class='phone'>
        <i class="fa fa-phone" aria-hidden="true"></i> `
  if(data.mobile_phone !== "undefined") {
    content += `${data.mobile_phone}`
  }
  content += `
      </div>
      <div class='phone'>
        <i class="fa fa-home" aria-hidden="true"></i> `
  if(data.home_phone !== "undefined") {
    content += `${data.home_phone}`
  }
  content += `
      </div>
      <div class='phone'>
        <i class="fa fa-briefcase" aria-hidden="true"></i> `
  if(data.work_phone !== "undefined") {
    content += `${data.work_phone}`
  }
  content += `
      </div>
      <div class='email'>
        <a href="mailto:${data.email}"><i class="fa fa-envelope-o" aria-hidden="true"></i></a> `
  if(data.email !== "undefined") {
    content += `${data.email}`
  }
  content += `
      </div>
    </div>`;

  $(`#${data.id} + .jobTitle`).append(content);
}

// Search contacts
function searchField(){
  $('#search-contact').on('focus', function() {
		$(this).attr('placeholder','');
	});
	$('#search-contact').on('blur', function() {
		$(this).attr('placeholder',"Type name");
	});
	$('#search-contact').on('input',function() {
		let name = $(this).val().toLowerCase();
    findContact(name);
  });
}
function findContact(string) {
  let $ele = $('.list tr');
  if (sortBy == "first") {
    var idx = 0;
  } else {
    var idx = 1;
  }
  $ele.each(function() {
    let $cont = `${$(this)[0].innerText}`.split(" ")[idx].toLowerCase();
    if ($cont.indexOf(string) > -1) {
      $(this).css('display','table-row');
    } else {
      $(this).css('display','none');
    }
  });
}
function filterContact(event) {
  $('div.search').css({
    display: "block"
  });
  searchField();
}
function cancelSearch(event) {
  $('#search-contact').val('');
  $(`div.search`).css('display','none');
  getAllContacts();
}

// Create contacts
function createNewContactForm(event) {
  // Display 'Create contact' button
  $(`button.form-btn.update`).css('display','none');
  $(`button.form-btn.new`).css('display','inline-block');
  
  clearInputFields();
  $("div#contacts").css({
    display: "none"
  });
  $('div.form').css({
    display: "block"
  });
  $('.info').remove();
}
function requestAdd(){
  if (request) {
    return;
  }
  request = true;
  idNum++;
  var url = "http://dev.alexshoucri.com:8888/contacts/"
  $.ajax({
    url : url,
    type: "POST",
    data: JSON.stringify({
      id: idNum,
      name: {
        first: $('input[name=firstName]').val(),
        last: $('input[name=lastName]').val()
      },
      jobTitle: $('input[name=jobTitle]').val(),
      address: {
        address1: $('input[name=address1]').val(),
        address2: $('input[name=address2]').val(),
        city: $('input[name=city]').val(),
        state: $('input[name=province]').val(),
        zip: $('input[name=zip]').val()
      },
      mobile_phone: $('input[name=phoneMobile]').val(),
      home_phone: $('input[name=phoneHome]').val(),
      work_phone: $('input[name=phoneWork]').val(),
      email: $('input[name=email]').val(),
      photo: $('input[name=photo]').val()
    }),
    contentType: "application/json; charset=utf-8",
    dataType   : "json"
})
  .done(contactCreated);
  return idNum;
}
function contactCreated(){
  request = false;
  // Show on HTML what you found
  $("div.form").css({
    display: "none"
  });
  $(".container").append(`
    <div class='confirm'>
      <p class='msg'><i class="fa fa-check-circle-o" aria-hidden="true"></i> Your contact was succesfully created</p>
    </div>`
  );
  $('.confirm').css({
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    paddingTop: '50vh',
    fontSize: '30px',
    backgroundColor: 'rgba(0,0,0,0.85)'
  });
  setTimeout(function(){
    $(`.confirm`).remove();
    $(`#contacts`).css('display','block');
  }, 1500);
  getAllContacts();
}

// Modify contacts
function editContact(event){
  // To edit profile
  let contactId = event.target.parentElement.parentElement.classList[1];
  getProfile(contactId, requestedContactInfoForEdit);
  $('.info').remove();
}
function requestedContactInfoForEdit(data){
  request = false;
  // Display 'Update contact' button
  $(`button.form-btn.new`).css('display','none');
  $(`button.form-btn.update`).css('display','inline-block');

  $('div.form').css("display","block");
  $('input[name=contactId]').val(`${data.id}`);                // Contact Id
  $('input[name=firstName]').val(`${data.name.first}`);                // First Name
  $('input[name=lastName]').val(`${data.name.last}`);                  //Last Name
  $('input[name=jobTitle]').val(`${data.jobTitle}`);                   //Job Title
  $('input[name=address1]').val(`${data.address.address1}`);           // Address 1
  $('input[name=address2]').val(`${data.address.address2}`);                    // Address 2
  $('input[name=city]').val(`${data.address.city}`);                   // City
  $('input[name=province]').val(`${data.address.state}`);              // State or Province
  $('input[name=zip]').val(`${data.address.zip}`);                     // Zip code
  $('input[name=phoneMobile]').val(`${data.phone_mobile}`);     // Mobile number
  $('input[name=phoneHome]').val(`${data.phone_home}`);         // Home number
  $('input[name=phoneWork]').val(`${data.phone_work}`);         // Work number
  $('input[name=email]').val(`${data.email}`);                         // Email
  $('input[name=photo]').val(`${data.photo}`);                         // Profil picture
}
function requestUpdate(id){
  if (request) {
    return;
  }
  request = true;
  let url = "http://dev.alexshoucri.com:8888/contacts/" + id;
  $.ajax({
  url : url,
  type: "PUT",
  data: JSON.stringify({
    id: id,
    name: {
      first: $('input[name=firstName]').val(),
      last: $('input[name=lastName]').val()
    },
    jobTitle: $('input[name=jobTitle]').val(),
    address: {
      address1: $('input[name=address1]').val(),
      address2: $('input[name=address2]').val(),
      city: $('input[name=city]').val(),
      state: $('input[name=province]').val(),
      zip: $('input[name=zip]').val()
    },
    mobile_phone: $('input[name=phoneMobile]').val(),
    home_phone: $('input[name=phoneHome]').val(),
    work_phone: $('input[name=phoneWork]').val(),
    email: $('input[name=email]').val(),
    photo: $('input[name=photo]').val()
  }),
  contentType: "application/json; charset=utf-8",
  dataType   : "json"
})
  .done(contactUpdated);
}
function contactUpdated() {
  request = false;
  clearInputFields();
  $("div.form").css({
    display: "none"
  })
  $(".container").append(`
    <div class='confirm'>
      <p class='msg'><i class="fa fa-check-circle-o" aria-hidden="true"></i> Your contact was succesfully updated</p>
    </div>`
  );
  $('.confirm').css({
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    paddingTop: '50vh',
    fontSize: '30px',
    backgroundColor: 'rgba(0,0,0,0.85)'
  });
  setTimeout(function(){
    $(`.confirm`).remove();
  }, 1500);
  getAllContacts();
}

// Delete contacts
function confirmDeleteOfContact(event){
  $(".container").append(`
    <div class='confirm'>
      <p class='msg'>Are you sure you want to delete this contact?</p>
      <button class='del-btn accept' type="button" name="accept">Yes</button>&nbsp;<button class='del-btn cancel' type="button" name="cancel">Cancel</button>
    </div>`
  );

  $('.confirm').css({
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    paddingTop: '50vh',
    fontSize: '30px',
    backgroundColor: 'rgba(0,0,0,0.85)'
  });
  $('.del-btn').css({
    fontSize: '28px',
    width: '90px',
    height: '40px',
  })

    $("button.del-btn.accept").on("click", function(){
      deleteContact(event.target.parentElement.parentElement.classList[1]);
    });
    $("button.del-btn.cancel").on("click", getAllContacts);



}
function deleteContact(id){
  if (request) {
    return;
  }
  request = true;
  let url = "http://dev.alexshoucri.com:8888/contacts/" + id;
  $.ajax({
    url: url,
    method: "DELETE"
  })
  .done(contactDeleted);
}
function contactDeleted(){
  request = false;
  $(`.confirm`).remove();
  $("div.form").css({
    display: "none"
  })
  $(".container").append(`
    <div class='confirm'>
      <p class='msg'><i class="fa fa-check-circle-o" aria-hidden="true"></i> Your contact was succesfully deleted</p>
    </div>`
  );
  $(`i.fa.fa-check-circle-o`).css('color','rgba(255,255,255,1)');
  $('.confirm').css({
    display: 'block',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0',
    paddingTop: '50vh',
    fontSize: '30px',
    backgroundColor: 'rgba(0,0,0,0.85)'
  });
  setTimeout(function(){
    $(`.confirm`).remove();
  }, 1500);
  getAllContacts();
}
