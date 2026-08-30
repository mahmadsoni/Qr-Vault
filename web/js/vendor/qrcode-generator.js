/* QR Vault — vendor/qrcode-generator.js
   Self-hosted QR code encoder (ISO/IEC 18004), byte mode, versions 1-20,
   all four error-correction levels. No CDN or network dependency.
   Verified end-to-end (including UTF-8 text, vCard payloads, long text
   forcing multi-block Reed-Solomon, and forced low/high versions)
   against an independent zbar decode during development.
*/
var qrcode = (function() {

  var QRMode = { MODE_8BIT_BYTE: 4 };
  var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
  var G15 = 0x537;
  var G18 = 0x1f25;
  var G15_MASK = 0x5412;

  var QRMath = (function() {
    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);
    for (var i = 0; i < 8; i += 1) EXP_TABLE[i] = 1 << i;
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) LOG_TABLE[EXP_TABLE[i]] = i;
    return {
      glog: function(n) { if (n < 1) throw new Error('glog(' + n + ')'); return LOG_TABLE[n]; },
      gexp: function(n) { while (n < 0) n += 255; while (n >= 256) n -= 255; return EXP_TABLE[n]; }
    };
  })();

  function qrPolynomial(num, shift) {
    var offset = 0;
    while (offset < num.length && num[offset] === 0) offset += 1;
    var _num = new Array(num.length - offset + shift).fill(0);
    for (var i = 0; i < num.length - offset; i += 1) _num[i] = num[i + offset];

    var _this = {};
    _this.getAt = function(index) { return _num[index]; };
    _this.getLength = function() { return _num.length; };
    _this.multiply = function(e) {
      var res = new Array(_this.getLength() + e.getLength() - 1).fill(0);
      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          res[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
        }
      }
      return qrPolynomial(res, 0);
    };
    _this.mod = function(e) {
      if (_this.getLength() - e.getLength() < 0) return _this;
      var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));
      var num2 = new Array(_this.getLength());
      for (var i = 0; i < _this.getLength(); i += 1) num2[i] = _this.getAt(i);
      for (var i = 0; i < e.getLength(); i += 1) num2[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
      return qrPolynomial(num2, 0).mod(e);
    };
    return _this;
  }

  // [blockCount, totalCount, dataCount] per version (rows) x L,M,Q,H (in that order)
  var RS_BLOCK_TABLE = [
    [1,26,19],[1,26,16],[1,26,13],[1,26,9],
    [1,44,34],[1,44,28],[1,44,22],[1,44,16],
    [1,70,55],[1,70,44],[2,35,17],[2,35,13],
    [1,100,80],[2,50,32],[2,50,24],[4,25,9],
    [1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],
    [2,86,68],[4,43,27],[4,43,19],[4,43,15],
    [2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],
    [2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],
    [2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],
    [2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],
    [4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],
    [2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],
    [4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],
    [3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],
    [5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],
    [5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],
    [1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],
    [5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],
    [3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],
    [3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16]
  ];

  var PATTERN_POSITION_TABLE = [
    [],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],
    [6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],
    [6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90]
  ];

  var MAX_VERSION = 20;

  function getRsBlockTable(typeNumber, ecLevel) {
    var col = ecLevel === QRErrorCorrectLevel.L ? 0 : ecLevel === QRErrorCorrectLevel.M ? 1 : ecLevel === QRErrorCorrectLevel.Q ? 2 : 3;
    return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + col];
  }

  function getRSBlocks(typeNumber, ecLevel) {
    var rsBlock = getRsBlockTable(typeNumber, ecLevel);
    if (!rsBlock) throw new Error('bad rs block @ typeNumber:' + typeNumber);
    var length = rsBlock.length / 3;
    var list = [];
    for (var i = 0; i < length; i += 1) {
      var count = rsBlock[i * 3 + 0];
      var totalCount = rsBlock[i * 3 + 1];
      var dataCount = rsBlock[i * 3 + 2];
      for (var j = 0; j < count; j += 1) list.push({ totalCount: totalCount, dataCount: dataCount });
    }
    return list;
  }

  function qrBitBuffer() {
    var _buffer = [];
    var _length = 0;
    var _this = {};
    _this.getBuffer = function() { return _buffer; };
    _this.getLengthInBits = function() { return _length; };
    _this.putBit = function(bit) {
      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) _buffer.push(0);
      if (bit) _buffer[bufIndex] |= (0x80 >>> (_length % 8));
      _length += 1;
    };
    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) _this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    };
    return _this;
  }

  function stringToUtf8Bytes(str) {
    if (typeof TextEncoder !== 'undefined') return Array.from(new TextEncoder().encode(str));
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var code = str.codePointAt(i);
      if (code > 0xffff) i++;
      if (code < 0x80) bytes.push(code);
      else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
      else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 0x3f), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    }
    return bytes;
  }

  function qr8BitByte(data) {
    var _bytes = stringToUtf8Bytes(data);
    return {
      getMode: function() { return QRMode.MODE_8BIT_BYTE; },
      getLength: function() { return _bytes.length; },
      write: function(buffer) { for (var i = 0; i < _bytes.length; i += 1) buffer.put(_bytes[i], 8); }
    };
  }

  function getLengthInBits(typeNumber) {
    return typeNumber < 10 ? 8 : 16;
  }

  function getErrorCorrectPolynomial(errorCorrectLength) {
    var a = qrPolynomial([1], 0);
    for (var i = 0; i < errorCorrectLength; i += 1) a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
    return a;
  }

  function createBytes(buffer, rsBlocks) {
    var offset = 0, maxDcCount = 0, maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length);
    var ecdata = new Array(rsBlocks.length);
    for (var r = 0; r < rsBlocks.length; r += 1) {
      var dcCount = rsBlocks[r].dataCount;
      var ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (var i = 0; i < dcdata[r].length; i += 1) dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      offset += dcCount;
      var rsPoly = getErrorCorrectPolynomial(ecCount);
      var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
      var modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (var i = 0; i < ecdata[r].length; i += 1) {
        var modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }
    var totalCodeCount = 0;
    for (var i = 0; i < rsBlocks.length; i += 1) totalCodeCount += rsBlocks[i].totalCount;
    var data = new Array(totalCodeCount);
    var index = 0;
    for (var i = 0; i < maxDcCount; i += 1) for (var r = 0; r < rsBlocks.length; r += 1) if (i < dcdata[r].length) data[index++] = dcdata[r][i];
    for (var i = 0; i < maxEcCount; i += 1) for (var r = 0; r < rsBlocks.length; r += 1) if (i < ecdata[r].length) data[index++] = ecdata[r][i];
    return data;
  }

  function getBCHDigit(data) {
    var digit = 0;
    while (data !== 0) { digit += 1; data >>>= 1; }
    return digit;
  }

  function getBCHTypeInfo(data) {
    var d = data << 10;
    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
    return ((data << 10) | d) ^ G15_MASK;
  }

  function getBCHTypeNumber(data) {
    var d = data << 12;
    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
    return (data << 12) | d;
  }

  function getMaskFunction(pattern) {
    switch (pattern) {
      case 0: return function(i, j) { return (i + j) % 2 === 0; };
      case 1: return function(i, j) { return i % 2 === 0; };
      case 2: return function(i, j) { return j % 3 === 0; };
      case 3: return function(i, j) { return (i + j) % 3 === 0; };
      case 4: return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0; };
      case 5: return function(i, j) { return ((i * j) % 2) + ((i * j) % 3) === 0; };
      case 6: return function(i, j) { return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0; };
      case 7: return function(i, j) { return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0; };
      default: throw new Error('bad mask pattern:' + pattern);
    }
  }

  function getLostPoint(modules, moduleCount) {
    var lostPoint = 0;
    // N1: 5+ consecutive same-color modules in a row/column
    for (var row = 0; row < moduleCount; row += 1) {
      for (var col = 0; col < moduleCount; col += 1) {
        var sameCount = 0;
        var dark = modules[row][col];
        for (var r = -1; r <= 1; r += 1) {
          if (row + r < 0 || moduleCount <= row + r) continue;
          for (var c = -1; c <= 1; c += 1) {
            if (col + c < 0 || moduleCount <= col + c) continue;
            if (r === 0 && c === 0) continue;
            if (dark === modules[row + r][col + c]) sameCount += 1;
          }
        }
        if (sameCount > 5) lostPoint += (3 + sameCount - 5);
      }
    }
    // N2: 2x2 blocks of same color
    for (var row = 0; row < moduleCount - 1; row += 1) {
      for (var col = 0; col < moduleCount - 1; col += 1) {
        var count = 0;
        if (modules[row][col]) count += 1;
        if (modules[row + 1][col]) count += 1;
        if (modules[row][col + 1]) count += 1;
        if (modules[row + 1][col + 1]) count += 1;
        if (count === 0 || count === 4) lostPoint += 3;
      }
    }
    // N4: dark module ratio deviation from 50%
    var darkCount = 0;
    for (var row = 0; row < moduleCount; row += 1) {
      for (var col = 0; col < moduleCount; col += 1) {
        if (modules[row][col]) darkCount += 1;
      }
    }
    var ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  }

  function qrcodeFactory(typeNumber, errorCorrectionLevelStr) {
    var PAD0 = 0xEC, PAD1 = 0x11;
    var _typeNumber = typeNumber;
    var _ecLevel = QRErrorCorrectLevel[errorCorrectionLevelStr];
    var _modules = null;
    var _moduleCount = 0;
    var _dataList = [];
    var _this = {};

    _this.addData = function(data) { _dataList.push(qr8BitByte(data)); };

    function setupPositionProbePattern(row, col) {
      for (var r = -1; r <= 7; r += 1) {
        if (row + r <= -1 || _moduleCount <= row + r) continue;
        for (var c = -1; c <= 7; c += 1) {
          if (col + c <= -1 || _moduleCount <= col + c) continue;
          if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
              (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
              (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    }

    function setupTimingPattern() {
      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) continue;
        _modules[r][6] = (r % 2 === 0);
      }
      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) continue;
        _modules[6][c] = (c % 2 === 0);
      }
    }

    function setupPositionAdjustPattern() {
      var pos = PATTERN_POSITION_TABLE[_typeNumber - 1];
      for (var i = 0; i < pos.length; i += 1) {
        for (var j = 0; j < pos.length; j += 1) {
          var row = pos[i], col = pos[j];
          if (_modules[row][col] != null) continue;
          for (var r = -2; r <= 2; r += 1) {
            for (var c = -2; c <= 2; c += 1) {
              if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    }

    function setupTypeNumber(test) {
      var bits = getBCHTypeNumber(_typeNumber);
      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ((bits >> i) & 1) === 1);
        _modules[Math.floor(i / 3)][(i % 3) + _moduleCount - 8 - 3] = mod;
      }
      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ((bits >> i) & 1) === 1);
        _modules[(i % 3) + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    }

    function setupTypeInfo(test, maskPattern) {
      var data = (_ecLevel << 3) | maskPattern;
      var bits = getBCHTypeInfo(data);
      for (var i = 0; i < 15; i += 1) {
        var mod = (!test && ((bits >> i) & 1) === 1);
        if (i < 6) _modules[i][8] = mod;
        else if (i < 8) _modules[i + 1][8] = mod;
        else _modules[_moduleCount - 15 + i][8] = mod;
      }
      for (var i = 0; i < 15; i += 1) {
        var mod = (!test && ((bits >> i) & 1) === 1);
        if (i < 8) _modules[8][_moduleCount - i - 1] = mod;
        else if (i < 9) _modules[8][15 - i - 1 + 1] = mod;
        else _modules[8][15 - i - 1] = mod;
      }
      _modules[_moduleCount - 8][8] = !test;
    }

    function mapData(data, maskPattern) {
      var inc = -1, row = _moduleCount - 1, bitIndex = 7, byteIndex = 0;
      var maskFunc = getMaskFunction(maskPattern);
      for (var col = _moduleCount - 1; col > 0; col -= 2) {
        if (col === 6) col -= 1;
        while (true) {
          for (var c = 0; c < 2; c += 1) {
            if (_modules[row][col - c] == null) {
              var dark = false;
              if (byteIndex < data.length) dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
              if (maskFunc(row, col - c)) dark = !dark;
              _modules[row][col - c] = dark;
              bitIndex -= 1;
              if (bitIndex === -1) { byteIndex += 1; bitIndex = 7; }
            }
          }
          row += inc;
          if (row < 0 || _moduleCount <= row) { row -= inc; inc = -inc; break; }
        }
      }
    }

    function createData(typeNumber, ecLevel, dataList) {
      var rsBlocks = getRSBlocks(typeNumber, ecLevel);
      var buffer = qrBitBuffer();
      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), getLengthInBits(typeNumber));
        data.write(buffer);
      }
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) totalDataCount += rsBlocks[i].dataCount;
      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw new Error('too-long');
      }
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) buffer.put(0, 4);
      while (buffer.getLengthInBits() % 8 !== 0) buffer.putBit(false);
      var toggle = true;
      while (buffer.getLengthInBits() < totalDataCount * 8) {
        buffer.put(toggle ? PAD0 : PAD1, 8);
        toggle = !toggle;
      }
      return createBytes(buffer, rsBlocks);
    }

    function makeImpl(test, maskPattern, dataCache) {
      _moduleCount = _typeNumber * 4 + 17;
      _modules = new Array(_moduleCount);
      for (var row = 0; row < _moduleCount; row += 1) {
        _modules[row] = new Array(_moduleCount).fill(null);
      }
      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);
      if (_typeNumber >= 7) setupTypeNumber(test);
      mapData(dataCache, maskPattern);
    }

    function getBestMaskPattern(dataCache) {
      var minLostPoint = 0, pattern = 0;
      for (var i = 0; i < 8; i += 1) {
        makeImpl(true, i, dataCache);
        var lostPoint = getLostPoint(_modules, _moduleCount);
        if (i === 0 || minLostPoint > lostPoint) { minLostPoint = lostPoint; pattern = i; }
      }
      return pattern;
    }

    _this.make = function() {
      if (_typeNumber < 1) {
        var tn = 1;
        for (; tn <= MAX_VERSION; tn += 1) {
          try {
            createData(tn, _ecLevel, _dataList);
            break;
          } catch (e) {
            if (tn === MAX_VERSION) throw new Error('too-long');
          }
        }
        _typeNumber = tn;
      }
      var dataCache = createData(_typeNumber, _ecLevel, _dataList);
      var maskPattern = getBestMaskPattern(dataCache);
      makeImpl(false, maskPattern, dataCache);
    };

    _this.getModuleCount = function() { return _moduleCount; };
    _this.isDark = function(row, col) { return !!_modules[row][col]; };

    return _this;
  }

  return function(typeNumber, ecLevel) { return qrcodeFactory(typeNumber, ecLevel); };
})();

if (typeof module !== 'undefined') module.exports = qrcode;
