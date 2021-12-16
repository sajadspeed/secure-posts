const rootPath = require('electron-root-path').rootPath;
const fs = require('fs');
const $ = require('jquery');
const SHA256 = require("crypto-js/sha256");
const AES = require('crypto-js/aes');
const encUtf8 = require('crypto-js/enc-utf8');
const Dialogs = require('dialogs');
const dialog = require('dialogs');
const dialogs = Dialogs();

let status = 0; // 0=> No login 1=> Login

let aesKey = "";

const infoPath = rootPath+'/src/data/user_info.json';
const secureFilesDir = rootPath+'/src/data/secure_files/';

const secureFilesInfo = secureFilesDir + "info.json";

const fileOptions = {encoding: 'utf-8'};

let currentOpenFileId = 0;

const token = "971111b9845511a92c654a43e668fb8279520675aa26de1e3cd75f63e2f5e182";

let saveCurrentFile = true;

$(document).ready(()=>{
	fs.open(infoPath, 'r', (error)=>{
		if(error){
			$("#login-header").html("ثبت نام");
			$("#login-button").html("ثبت نام");
			$("#login-button").attr("onclick", "signUp()");
		}
	});
})

const signUp = ()=>{
	aesKey = $("#username").val()+hash($("#password").val());
	fs.writeFile(infoPath, JSON.stringify(
		{
			encryption_token: encrypt(token),
		}
	), (error)=>{
		console.log(error);
		if(action(error)){
			status = 1;
			initialize();
		}
	})
}


const login = ()=> {
	fs.readFile(infoPath, fileOptions, (error, data)=>{
		if(action(error)){
			const {encryption_token} = JSON.parse(data);
			aesKey = $("#username").val()+hash($("#password").val());
			if(decrypt(encryption_token) == token){
				status = 1;
				initialize();
			}
			else{
				alert("نام‌کاربری یا پسورد اشتباه است");
			}
		}
	});
}

const deleteUser = ()=>{
	dialogs.confirm("آیا مطمئن هستید؟", ok => {
		console.log(ok);
		if(ok){
			fs.unlinkSync(infoPath);
			alert("از برنامه خارج و دوباره وارد شوید")
		}
	})
}

const initialize = ()=>{
	$("#login").slideUp(200);
	showFilesList();
}

const addFile = (data = "")=>{
	dialogs.prompt("عنوان پست:", fileName => {
		if(typeof fileName == 'string' && fileName.length > 0){
			const filesInfo = JSON.parse(fs.readFileSync(secureFilesInfo));
			filesInfo.last_id++;
			fs.writeFile(generateFilePath(filesInfo.last_id), data, (error)=>{
				if(action(error)){
					const tmpDate = parseInt(new Date().getTime()/1000);
					filesInfo.files.push({
						id: filesInfo.last_id,
						name: encrypt(fileName),
						date: tmpDate
					});
					fs.writeFile(secureFilesInfo, JSON.stringify(filesInfo), fileOptions, (error)=>{
						if(error){
							alert("خطا");
							fs.unlink(generateFilePath(filesInfo.last_id));
						}
						else{
							$("#file-list").append(view_file(fileName, filesInfo.last_id, tmpDate));
							$("#file-list").animate({ scrollTop: $("#file-list")[0].scrollHeight}, 500);
							openFile(filesInfo.last_id);
							setSaveStatus(true);
						}
					})
				}
			});
		}
	})
}

const openFile = (fileId) => {
	if(!saveCurrentFile)
		saveFile();
	fs.readFile(generateFilePath(fileId), fileOptions, (error, data) => {
		if(action(error)){
			$("#file_"+currentOpenFileId).removeClass("active");
			$("#file_"+fileId).addClass("active");
			currentOpenFileId = fileId;
			$("#visual-view").html(decrypt(data));
			$("#date").html(date($("#file_"+fileId).attr("date")));
			setInterval(() => {
				saveFile();
			}, 60000 * 3); // Save in every 3min
		}
	})
}

const saveFile = () => {
	const data = encrypt($("#visual-view").html());
	if(currentOpenFileId == 0)
		addFile(data);
	else{
		fs.writeFile(generateFilePath(currentOpenFileId), data, fileOptions, error => {
			if(action(error))
				setSaveStatus(true);
		});
	}
}

const setSaveStatus = (saveStatus) => {
	if(saveStatus)
		$("#save-dot").fadeOut();
	else
		$("#save-dot").fadeIn();
	saveCurrentFile = saveStatus;
}

const showFilesList = ()=>{
	const filesInfo = JSON.parse(fs.readFileSync(secureFilesInfo));
	for (const file of filesInfo.files) {
		$("#file-list").append(view_file(decrypt(file.name), file.id, file.date));
	}
}

const togglePassword = (_this) => {
    var inputPassword = _this.previousElementSibling.previousElementSibling;
    if(inputPassword.type == 'password'){
        inputPassword.type = 'text'
        _this.className = 'ri-eye-off-line';
    } 
    else{ 
        inputPassword.type = 'password';
        _this.className = 'ri-eye-line';
    }
};


const generateFilePath = fileId => secureFilesDir+fileId+".ss";

const view_file = (fileName, fileId, date)=>{
	return '<div class="file" id="file_'+fileId+'" onclick="openFile('+fileId+')" date="'+date+'"><i class="ri-file-text-line"></i><span>'+fileName+'</span></div>';
}

const action = (error) => {
	if(error){
		alert("خطا در عملیات");
		return false;
	}
	return true;
}

const encrypt = (plain) => {
	return AES.encrypt(plain, aesKey).toString();
}

const decrypt = (cipher) => {
	return AES.decrypt(cipher, aesKey).toString(encUtf8);
}

const hash = (plain) => {
	return SHA256(plain).toString()
}

const date = (timestamp)=>{
	const date = new Date(timestamp * 1000);
	const g_y=date.getFullYear();
	const g_m=date.getMonth()+1;
	const g_d=date.getDate();

	const dateConverted = gregorian_to_jalali(g_y,g_m,g_d);

	return dateConverted[0]+"/"+dateConverted[1]+"/"+dateConverted[2]+" | "+date.getHours()+":"+('0' + date.getMinutes()).slice(-2)+"";
}

const gregorian_to_jalali = (gy, gm, gd)=> {
	let g_d_m, jy, jm, jd, gy2, days;
	g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	gy2 = (gm > 2) ? (gy + 1) : gy;
	days = 355666 + (365 * gy) + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
	jy = -1595 + (33 * ~~(days / 12053));
	days %= 12053;
	jy += 4 * ~~(days / 1461);
	days %= 1461;
	if (days > 365) {
	  jy += ~~((days - 1) / 365);
	  days = (days - 1) % 365;
	}
	if (days < 186) {
	  jm = 1 + ~~(days / 31);
	  jd = 1 + (days % 31);
	} else {
	  jm = 7 + ~~((days - 186) / 30);
	  jd = 1 + ((days - 186) % 30);
	}
	return [jy, jm, jd];
}

const typing = () => {
	setSaveStatus(false);
}

document.addEventListener('keydown', e => {
	console.log(e.ctrlKey, e.keyCode);
	if (status > 0 && e.ctrlKey && e.keyCode == 83) {
		e.preventDefault();
		saveFile();
	}
});