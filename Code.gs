/* 
 * BACKEND SAPU JAGAT PMII WIGA (VERSI 12 - FILE UPLOAD & MASTER REFACTORING)
 * Mendukung upload file pada form dinamis pendaftaran agenda
 */

var CONFIG = {
  TOKEN: "WIGA_SECRET_GUY2", 
  FOLDER_ID_PROFIL: "17m_ZCt_vZOd76nwFAKThLQ1ghppdbcSt",
  FOLDER_ID_KONTEN: "1-QNjt6C4EQqijaTKVTvHsQqddsavR9PN",
  FOLDER_ID_SERTIFIKAT: "1ZGAKhoTxtEGM0rz1QRjvrKymOHdp6T0N",
  FOLDER_ID_PENDAFTARAN: "13vGBnZe6d-FbuPvWtwIO54YC6NrdJ6PP" 
};

function doGet(e) {
  try {
    var token = e.parameter.token;
    if (token !== CONFIG.TOKEN) return response({ success: false, message: "Akses Ditolak" });
    var action = e.parameter.action;
    if (action === "get_members") return handleGetTable("users");
    if (action === "get_news") return handleGetTable("posts");
    if (action === "get_agendas") return handleGetTable("agendas");
    if (action === "get_participations") return handleGetTable("participations");
    if (action === "get_form_fields") return handleGetTable("form_fields");
    return response([]);
  } catch (err) { return response({ success: false, message: err.toString() }); }
}

function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    if (requestData.token !== CONFIG.TOKEN) return response({ success: false, message: "Akses Ditolak" });
    
    var action = requestData.action;
    var data = requestData.data;

    if (action === "register" || action === "create_member") return handleRegister(data);
    if (action === "login") return handleLogin(data);
    if (action === "update_member") return handleUpdateMember(data);
    if (action === "delete_member") return handleDeleteMember(data);
    if (action === "create_post") return handleCreatePost(data);
    if (action === "update_post") return handleUpdatePost(data);
    if (action === "create_agenda") return handleCreateAgenda(data);
    if (action === "update_agenda") return handleUpdateAgenda(data);
    if (action === "delete_agenda") return handleDeleteAgenda(data);
    if (action === "register_agenda") return handleRegisterAgenda(data);
    if (action === "update_participation") return handleUpdateParticipation(data);
    if (action === "add_form_field") return handleAddFormField(data);
    if (action === "upload_file") return handleUploadFile(data); // Fungsi upload mandiri
    
    return response({ success: false, message: "Aksi tidak dikenal" });
  } catch (err) { return response({ success: false, message: err.toString() }); }
}

function handleUploadFile(data) {
  var url = saveToDrive(data.base64, data.folderId || CONFIG.FOLDER_ID_PENDAFTARAN, data.fileName);
  return response({ success: true, url: url });
}

function handleAddFormField(data) {
  var sheet = getOrCreateSheet("form_fields", ["id", "label", "type", "options", "isRequired"]);
  var item = {
    id: "FLD-" + Utilities.getUuid().substring(0, 6).toUpperCase(),
    label: data.label,
    type: data.type,
    options: data.options || "",
    isRequired: data.isRequired === undefined ? true : data.isRequired
  };
  writeRowByHeader(sheet, item);
  return response({ success: true, message: "Field berhasil ditambahkan ke master." });
}

function handleRegisterAgenda(data) {
  var sheet = getOrCreateSheet("participations", ["id", "memberId", "agendaId", "status", "formData", "certificateUrl", "registeredAt"]);
  var uid = data.memberId;
  var aid = data.agendaId;
  
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var mIdIdx = headers.indexOf("memberId");
  var aIdIdx = headers.indexOf("agendaId");
  
  for(var i=1; i<values.length; i++) {
    if(String(values[i][mIdIdx]) === String(uid) && String(values[i][aIdIdx]) === String(aid)) {
      return response({ success: false, message: "Sahabat sudah terdaftar di agenda ini." });
    }
  }
  
  var item = {
    id: "REG-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
    memberId: uid,
    agendaId: aid,
    status: "Registered",
    formData: JSON.stringify(data.formData || {}),
    certificateUrl: "-",
    registeredAt: new Date()
  };
  writeRowByHeader(sheet, item);
  return response({ success: true, message: "Pendaftaran berhasil disimpan." });
}

function handleCreateAgenda(data) {
  var headers = ["id", "title", "slug", "date", "endDate", "time", "location", "content", "quota", "logoUrl", "registrationUrl", "facilities", "requirements", "createdAt", "authorId", "customFields", "contactPerson"];
  var sheet = getOrCreateSheet("agendas", headers);
  var imageUrl = data.logoBase64 ? saveToDrive(data.logoBase64, CONFIG.FOLDER_ID_PENDAFTARAN, "logo-" + data.title) : "";
  var slug = data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  
  var item = {
    id: "AGD-" + Utilities.getUuid().substring(0, 6).toUpperCase(),
    title: data.title,
    slug: slug,
    date: data.date,
    endDate: data.endDate,
    time: data.time || "",
    location: data.location,
    content: data.content,
    quota: data.quota,
    logoUrl: imageUrl,
    registrationUrl: data.registrationUrl || "",
    facilities: data.facilities || "",
    requirements: data.requirements || "",
    createdAt: new Date(),
    authorId: data.authorId,
    customFields: data.customFields || "[]",
    contactPerson: data.contactPerson || ""
  };
  writeRowByHeader(sheet, item);
  return response({ success: true });
}

function handleUpdateAgenda(data) {
  var sheet = getOrCreateSheet("agendas");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIndex] === data.id) {
      if (data.logoBase64 && data.logoBase64.length > 50) {
        var fiIdx = headers.indexOf("logoUrl");
        deleteFileByUrl(values[i][fiIdx]);
        var newUrl = saveToDrive(data.logoBase64, CONFIG.FOLDER_ID_PENDAFTARAN, "logo-" + data.title);
        // only update if image successfully created (or URL is returned)
        sheet.getRange(i + 1, fiIdx + 1).setValue(newUrl);
      }
      
      for (var key in data) {
        if (["id", "token", "action", "logoBase64"].indexOf(key) === -1) {
          var idx = headers.indexOf(key);
          if (idx > -1) sheet.getRange(i + 1, idx + 1).setValue(data[key]);
        }
      }
      return response({ success: true, message: "Agenda diperbarui." });
    }
  }
  return response({ success: false, message: "Agenda tidak ditemukan." });
}

function handleDeleteAgenda(data) {
  var sheet = getOrCreateSheet("agendas");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIndex] === data.id) {
      var fiIdx = headers.indexOf("logoUrl");
      var fileUrl = values[i][fiIdx];
      if (fileUrl && fileUrl.length > 0) deleteFileByUrl(fileUrl);
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Agenda dihapus." });
    }
  }
  return response({ success: false, message: "Agenda tidak ditemukan." });
}

function handleCreatePost(data) {
  var headers = ["id", "title", "slug", "content", "category", "excerpt", "featuredImage", "createdAt", "updatedAt", "author", "authorId", "status", "tags"];
  var sheet = getOrCreateSheet("posts", headers);
  var imageUrl = data.imageBase64 ? saveToDrive(data.imageBase64, CONFIG.FOLDER_ID_KONTEN, "KONTEN_" + Date.now()) : "";
  var category = (data.category || "Artikel").trim();
  var slug = data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  
  var item = {
    id: "P-" + Utilities.getUuid().substring(0, 6).toUpperCase(),
    title: data.title,
    slug: slug,
    content: data.content,
    category: category,
    excerpt: data.excerpt || "",
    featuredImage: imageUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: data.author,
    authorId: data.authorId,
    status: "Pending",
    tags: ""
  };
  writeRowByHeader(sheet, item);
  return response({ success: true });
}

function handleUpdatePost(data) {
  var sheet = getOrCreateSheet("posts");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var idIndex = headers.indexOf("id");
  for (var i = 1; i < values.length; i++) {
    if (values[i][idIndex] === data.id) {
      if (data.status) sheet.getRange(i + 1, headers.indexOf("status") + 1).setValue(data.status);
      sheet.getRange(i + 1, headers.indexOf("updatedAt") + 1).setValue(new Date());
      return response({ success: true, message: "Konten diperbarui." });
    }
  }
  return response({ success: false, message: "Konten tidak ditemukan." });
}

function handleUpdateMember(data) {
  var sheet = getOrCreateSheet("users");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var uIdx = headers.indexOf("uid");
  
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][uIdx]) === String(data.uid)) {
      if (data.photoBase64 && data.photoBase64.length > 50) {
        var pUrlIdx = headers.indexOf("photoUrl");
        var nIdx = headers.indexOf("name");
        deleteFileByUrl(values[i][pUrlIdx]);
        var fn = "PROFIL_" + String(values[i][nIdx]).toUpperCase().split(" ").join("_");
        var newUrl = saveToDrive(data.photoBase64, CONFIG.FOLDER_ID_PROFIL, fn);
        sheet.getRange(i + 1, pUrlIdx + 1).setValue(newUrl);
      }
      
      // Update any field present in data that matches headers
      for (var key in data) {
        if (["uid", "token", "action", "photoBase64"].indexOf(key) === -1) {
          var idx = headers.indexOf(key);
          if (idx > -1) sheet.getRange(i + 1, idx + 1).setValue(data[key]);
        }
      }
      
      return response({ success: true, message: "Profil diperbarui." });
    }
  }
  return response({ success: false, message: "User tidak ditemukan." });
}

function handleDeleteMember(data) {
  var sheet = getOrCreateSheet("users");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var uIdx = headers.indexOf("uid");
  
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][uIdx]) === String(data.uid)) {
      var pIdx = headers.indexOf("photoUrl");
      var pUrl = values[i][pIdx];
      if (pUrl && pUrl.length > 0) deleteFileByUrl(pUrl);
      sheet.deleteRow(i + 1);
      return response({ success: true, message: "Kader dihapus." });
    }
  }
  return response({ success: false, message: "User tidak ditemukan." });
}

function handleLogin(data) {
  var sheet = getOrCreateSheet("users");
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  var eIdx = headers.indexOf("email");
  var pIdx = headers.indexOf("password");
  
  var passwordInput = String(data.password);
  var hashedInput = hashPassword(passwordInput);

  for (var i = 1; i < values.length; i++) {
    var storedPassword = String(values[i][pIdx]);
    // Mewajibkan penggunaan Hash, menonaktifkan pengecekan plaintext asli
    if (String(values[i][eIdx]) === String(data.email) && storedPassword === hashedInput) {
      var user = {};
      headers.forEach(function(h, j) {
        user[h] = values[i][j];
      });
      return response({ success: true, user: user });
    }
  }
  return response({ success: false, message: "Login Gagal." });
}

function handleRegister(data) {
  var headers = ["uid", "name", "nim", "email", "jenisKelamin", "tempatLahir", "tanggalLahir", "alamat", "whatsapp", "komisariat", "statusKaderisasi", "role", "accountStatus", "password", "photoUrl", "createdAt", "lastLogin"];
  var sheet = getOrCreateSheet("users", headers);
  var photoUrl = "";
  if (data.photoBase64) photoUrl = saveToDrive(data.photoBase64, CONFIG.FOLDER_ID_PROFIL, "PROFIL_" + data.nim);
  
  var item = {
    uid: "UID-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
    name: data.name,
    nim: data.nim,
    email: data.email,
    jenisKelamin: data.jenisKelamin || "-",
    tempatLahir: data.tempatLahir || "-",
    tanggalLahir: data.tanggalLahir || "-",
    alamat: data.alamat || data.Alamat || "-",
    password: hashPassword(String(data.password)),
    whatsapp: data.whatsapp,
    komisariat: data.komisariat,
    statusKaderisasi: data.statusKaderisasi || "CALON",
    role: data.role || "CALON",
    accountStatus: data.accountStatus || "AKTIF",
    photoUrl: photoUrl,
    createdAt: new Date(),
    lastLogin: new Date()
  };
  writeRowByHeader(sheet, item);
  return response({ success: true });
}

function saveToDrive(base64Data, folderId, fileName) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var pureBase64 = base64Data.indexOf(",") > -1 ? base64Data.split(",")[1] : base64Data;
    var blob = Utilities.newBlob(Utilities.base64Decode(pureBase64), "image/jpeg", fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (e) { return ""; }
}

function deleteFileByUrl(url) {
  try { if (url && url.indexOf("/d/") > -1) DriveApp.getFileById(url.split("/d/")[1]).setTrashed(true); } catch (e) {}
}

function handleGetTable(name) {
  var sheet = getOrCreateSheet(name);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return response([]);
  var headers = data[0], items = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i], obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = (row[j] instanceof Date) ? row[j].toISOString() : row[j];
    items.push(obj);
  }
  return response(items);
}

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  if (headers && sheet.getLastRow() === 0) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  // Handle header drift/sync jika sudah ada tapi kurang kolom
  if (headers && sheet.getLastRow() > 0) {
    var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    for (var k = 0; k < headers.length; k++) {
      if (existingHeaders.indexOf(headers[k]) === -1) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(headers[k]);
    }
  }
  return sheet;
}

function response(content) {
  return ContentService.createTextOutput(JSON.stringify(content)).setMimeType(ContentService.MimeType.JSON);
}

function writeRowByHeader(sheet, itemObj) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowData = new Array(headers.length).fill("");
  for (var key in itemObj) {
    var idx = headers.indexOf(key);
    if (idx > -1) rowData[idx] = itemObj[key];
  }
  sheet.appendRow(rowData);
}

// Hash String menjadi format aman (SHA-256)
function hashPassword(plainText) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plainText, Utilities.Charset.UTF_8);
  var txtHash = '';
  for (var i = 0; i < rawHash.length; i++) {
    var hashVal = rawHash[i];
    if (hashVal < 0) {
      hashVal += 256;
    }
    if (hashVal.toString(16).length == 1) {
      txtHash += '0';
    }
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}
