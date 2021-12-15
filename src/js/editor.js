
const buttons = document.querySelectorAll('.btn');
var formatBlock = 'p';

document.execCommand("defaultParagraphSeparator", false, "p");

for(var i = 0; i < buttons.length; i++) {
    var button = buttons[i];

    button.addEventListener('click', function(e) {
        var action = this.dataset.action;
        switch(action) {
        case 'createLink':
            execLinkAction();
            break;
        case 'insertImage':
            execInsertImage();
            break;
        case 'h2':
            if(formatBlock == action)
                action = 'p';
            document.execCommand('formatBlock', false, action);
            formatBlock = action;
            break;
        default:
            execDefaultAction(action);
        }
        
    });
}

function execInsertImage() {
    var linkValue = prompt('Link of image:');
    if(linkValue != null){
        if(validURL(linkValue))
            document.execCommand('insertImage', false, linkValue);
        else 
            toast("Link invalid");
    }
}
function execLinkAction() {
    var linkValue = prompt('Link (e.g. https://looshare.com/)');
    if(linkValue != null){
        if(validURL(linkValue))
            document.execCommand('createLink', false, linkValue);
        else 
            toast("Link invalid");
    }
}

function validURL(str){
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

function execDefaultAction(action) {
    document.execCommand(action, false);
}