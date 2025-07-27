// Populate charset dropdowns
const charsets = [
  "UTF-8", "UTF-16", "UTF-16LE", "UTF-16BE", "UTF-32",
  "Shift_JIS", "EUC-JP", "ISO-2022-JP", "ISO-8859-1", "ISO-8859-2",
  "ISO-8859-3", "ISO-8859-4", "ISO-8859-5", "ISO-8859-6", "ISO-8859-7",
  "ISO-8859-8", "ISO-8859-9", "ISO-8859-10", "ISO-8859-13",
  "ISO-8859-14", "ISO-8859-15", "ISO-8859-16", "Windows-1250",
  "Windows-1251", "Windows-1252", "Windows-1253", "Windows-1254",
  "Windows-1255", "Windows-1256", "Windows-1257", "Windows-1258",
  "KOI8-R", "KOI8-U", "MacRoman"
];
const charsetSelects = [document.getElementById('decodeCharsetText'), document.getElementById('decodeCharsetFile')];

charsetSelects.forEach(select => {
  charsets.forEach(cs => {
    const option = document.createElement('option');
    option.value = cs;
    option.text = cs;
    select.appendChild(option);
  });
  select.value = "UTF-8";
});

function toggleLiveMode() {
  const live = document.getElementById('liveMode').checked;
  const input = document.getElementById('decodeInput');
  const charsetSelect = document.getElementById('decodeCharsetText');
  const decodeBtn = document.getElementById('decodeBtnText');

  if (live) {
    input.addEventListener("input", liveDecodeHandler);
    charsetSelect.disabled = true;
    decodeBtn.disabled = true;
  } else {
    input.removeEventListener("input", liveDecodeHandler);
    charsetSelect.disabled = false;
    decodeBtn.disabled = false;
  }
}

function liveDecodeHandler() {
  const inputText = document.getElementById("decodeInput").value.trim();
  const charset = document.getElementById("decodeCharsetText").value;
  const newline = document.getElementById("newlineOption").value;
  const decodeEachLine = document.getElementById("decodeEachLine").checked;
  const urlSafe = document.getElementById("urlSafe").checked;
  const status = document.getElementById("decodeJsonStatus");

  if (charset !== "UTF-8") {
    status.textContent = "Live mode works with UTF-8 only.";
    status.classList.add("invalid");
    status.classList.remove("success");
    return;
  }

  try {
    const decoded = decodeBase64(inputText, charset, newline, decodeEachLine, urlSafe);
    document.getElementById("decodeOutputText").value = decoded;
    status.textContent = "Decoded successfully.";
    status.classList.remove("invalid");
    status.classList.add("success");
  } catch (err) {
    status.textContent = "Invalid Base64 input.";
    status.classList.add("invalid");
    status.classList.remove("success");
  }
}

function decodeFromText() {
  const inputText = document.getElementById("decodeInput").value.trim();
  const charset = document.getElementById("decodeCharsetText").value;
  const newline = document.getElementById("newlineOption").value;
  const decodeEachLine = document.getElementById("decodeEachLine").checked;
  const urlSafe = document.getElementById("urlSafe").checked;
  const status = document.getElementById("decodeJsonStatus");

  try {
    const decoded = decodeBase64(inputText, charset, newline, decodeEachLine, urlSafe);
    document.getElementById("decodeOutputText").value = decoded;
    status.textContent = "Decoded successfully.";
    status.classList.remove("invalid");
    status.classList.add("success");
  } catch (err) {
    status.textContent = "Invalid Base64 input.";
    status.classList.add("invalid");
    status.classList.remove("success");
  }
}

function decodeFromFile() {
  const fileInput = document.getElementById("decodeFile");
  const charset = document.getElementById("decodeCharsetFile").value;
  const newline = document.getElementById("newlineOptionFile").value;
  const decodeEachLine = document.getElementById("decodeEachLineFile").checked;
  const urlSafe = document.getElementById("urlSafeFile").checked;
  const output = document.getElementById("decodeOutputFile");

  if (!fileInput.files.length) {
    alert("Please choose a file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const fileContent = e.target.result.trim();
    try {
      const decoded = decodeBase64(fileContent, charset, newline, decodeEachLine, urlSafe);
      output.value = decoded;
      output.classList.remove("invalid");
    } catch (err) {
      output.value = "Invalid Base64 input.";
      output.classList.add("invalid");
    }
  };
  reader.readAsText(fileInput.files[0]);
}

function decodeBase64(input, charset, newline, decodeEachLine, urlSafe) {
  const lines = decodeEachLine ? input.split(/\r?\n/) : [input];
  const decodedLines = lines.map(line => {
    if (urlSafe) {
      line = line.replace(/-/g, '+').replace(/_/g, '/');
      while (line.length % 4 !== 0) line += '=';
    }

    const binaryStr = atob(line);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    if (charset === "UTF-8") {
      return new TextDecoder().decode(bytes);
    } else {
      return Encoding.convert(bytes, {
        to: "UNICODE",
        from: charset,
        type: "string"
      });
    }
  });

  return decodedLines.join(newline === "CRLF" ? "\r\n" : "\n");
}

function copyOutput(id) {
  const textArea = document.getElementById(id);
  textArea.select();
  textArea.setSelectionRange(0, 99999); // for mobile
  document.execCommand("copy");
  alert("Copied to clipboard");
}

function downloadOutput(id, extension = 'txt') {
  const text = document.getElementById(id).value;
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `decoded_output.${extension}`;
  link.click();
}
