/**
 * Midnight Mass — Sacred QR Code Generator & Growth Hub Engine
 * Pure Vanilla JS ISO/IEC 18004 Compliant QR Generator with Dynamic UTM Tracking
 * High Error Correction Level (Level H - 30% Data Recovery) for Center Logo Emblems
 */

// ISO/IEC 18004 Compliant Real QR Code Matrix Engine
const MidnightQR = (function () {
  function QR8bitByte(data) {
    this.mode = 4; // 8-bit byte mode
    this.data = data;
  }
  QR8bitByte.prototype = {
    getLength: function () { return this.data.length; },
    write: function (buffer) {
      for (var i = 0; i < this.data.length; i++) {
        buffer.put(this.data.charCodeAt(i), 8);
      }
    }
  };

  function QRCodeModel(typeNumber, errorCorrectionLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectionLevel = errorCorrectionLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataCache = null;
    this.dataList = [];
  }

  QRCodeModel.prototype = {
    addData: function (data) {
      var newData = new QR8bitByte(data);
      this.dataList.push(newData);
      this.dataCache = null;
    },
    isDark: function (row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        throw new Error(row + "," + col);
      }
      return this.modules[row][col];
    },
    getModuleCount: function () { return this.moduleCount; },
    make: function () {
      if (this.typeNumber < 1) {
        var typeNumber = 1;
        for (typeNumber = 1; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, this.errorCorrectionLevel);
          var buffer = new QRBitBuffer();
          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }
          for (var i = 0; i < this.dataList.length; i++) {
            var data = this.dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
          }
          if (buffer.getLengthInBits() <= totalDataCount * 8) break;
        }
        this.typeNumber = typeNumber;
      }
      this.makeImpl(false, this.getBestMaskPattern());
    },
    makeImpl: function (test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);
      for (var row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);
        for (var col = 0; col < this.moduleCount; col++) {
          this.modules[row][col] = null;
        }
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(test, maskPattern);
      if (this.typeNumber >= 7) {
        this.setupTypeNumber(test);
      }
      if (this.dataCache == null) {
        this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectionLevel, this.dataList);
      }
      this.mapData(this.dataCache, maskPattern);
    },
    setupPositionProbePattern: function (row, col) {
      for (var r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r) continue;
        for (var c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c) continue;
          if ((0 <= r && r <= 6 && (c == 0 || c == 6)) || (0 <= c && c <= 6 && (r == 0 || r == 6)) || (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    },
    getBestMaskPattern: function () {
      var minLostPoint = 0;
      var pattern = 0;
      for (var i = 0; i < 8; i++) {
        this.makeImpl(true, i);
        var lostPoint = QRUtil.getLostPoint(this);
        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }
      return pattern;
    },
    setupTimingPattern: function () {
      for (var r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] != null) continue;
        this.modules[r][6] = (r % 2 == 0);
      }
      for (var c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c] != null) continue;
        this.modules[6][c] = (c % 2 == 0);
      }
    },
    setupPositionAdjustPattern: function () {
      var pos = QRUtil.getPatternPosition(this.typeNumber);
      for (var i = 0; i < pos.length; i++) {
        for (var j = 0; j < pos.length; j++) {
          var row = pos[i];
          var col = pos[j];
          if (this.modules[row][col] != null) continue;
          for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
              if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    },
    setupTypeNumber: function (test) {
      var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
      for (var i = 0; i < 18; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
      }
      for (var i = 0; i < 18; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    },
    setupTypeInfo: function (test, maskPattern) {
      var data = (this.errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);
      for (var i = 0; i < 15; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        if (i < 6) {
          this.modules[i][8] = mod;
        } else if (i < 8) {
          this.modules[i + 1][8] = mod;
        } else {
          this.modules[this.moduleCount - 15 + i][8] = mod;
        }
      }
      for (var i = 0; i < 15; i++) {
        var mod = (!test && ((bits >> i) & 1) == 1);
        if (i < 8) {
          this.modules[8][this.moduleCount - i - 1] = mod;
        } else if (i < 9) {
          this.modules[8][15 - i - 1 + 1] = mod;
        } else {
          this.modules[8][15 - i - 1] = mod;
        }
      }
      this.modules[this.moduleCount - 8][8] = (!test);
    },
    mapData: function (data, maskPattern) {
      var inc = -1;
      var row = this.moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      for (var col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col == 6) col--;
        while (true) {
          for (var c = 0; c < 2; c++) {
            if (this.modules[row][col - c] == null) {
              var dark = false;
              if (byteIndex < data.length) {
                dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
              }
              var mask = QRUtil.getMask(maskPattern, row, col - c);
              if (mask) dark = !dark;
              this.modules[row][col - c] = dark;
              bitIndex--;
              if (bitIndex == -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
  };

  QRCodeModel.createData = function (typeNumber, errorCorrectionLevel, dataList) {
    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);
    var buffer = new QRBitBuffer();
    for (var i = 0; i < dataList.length; i++) {
      var data = dataList[i];
      buffer.put(data.mode, 4);
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
      data.write(buffer);
    }
    var totalDataCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + (totalDataCount * 8) + ")");
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0xEC, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) break;
      buffer.put(0x11, 8);
    }
    return QRCodeModel.createBytes(buffer, rsBlocks);
  };

  QRCodeModel.createBytes = function (buffer, rsBlocks) {
    var offset = 0;
    var maxDcCount = 0;
    var maxEcCount = 0;
    var dcdata = new Array(rsBlocks.length);
    var ecdata = new Array(rsBlocks.length);
    for (var r = 0; r < rsBlocks.length; r++) {
      var dcCount = rsBlocks[r].dataCount;
      var ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (var i = 0; i < dcdata[r].length; i++) {
        dcdata[r][i] = 0xff & buffer.buffer[i + offset];
      }
      offset += dcCount;
      var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
      var modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (var i = 0; i < ecdata[r].length; i++) {
        var modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = (modIndex >= 0) ? modPoly.get(modIndex) : 0;
      }
    }
    var totalCodeCount = 0;
    for (var i = 0; i < rsBlocks.length; i++) {
      totalCodeCount += rsBlocks[i].totalCount;
    }
    var data = new Array(totalCodeCount);
    var index = 0;
    for (var i = 0; i < maxDcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < dcdata[r].length) {
          data[index++] = dcdata[r][i];
        }
      }
    }
    for (var i = 0; i < maxEcCount; i++) {
      for (var r = 0; r < rsBlocks.length; r++) {
        if (i < ecdata[r].length) {
          data[index++] = ecdata[r][i];
        }
      }
    }
    return data;
  };

  var QRMode = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 };
  var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
  var QRMaskPattern = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 };

  var QRUtil = {
    PATTERN_POSITION_TABLE: [
      [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
      [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54],
      [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70],
      [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86],
      [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]
    ],
    G15: (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0),
    G18: (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0),
    G15_MASK: (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1),
    getBCHTypeInfo: function (data) {
      var d = data << 10;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
        d ^= (QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15)));
      }
      return ((data << 10) | d) ^ QRUtil.G15_MASK;
    },
    getBCHTypeNumber: function (data) {
      var d = data << 12;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
        d ^= (QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18)));
      }
      return (data << 12) | d;
    },
    getBCHDigit: function (data) {
      var digit = 0;
      while (data != 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    },
    getPatternPosition: function (typeNumber) {
      return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1] || [];
    },
    getMask: function (maskPattern, i, j) {
      switch (maskPattern) {
        case QRMaskPattern.PATTERN000: return (i + j) % 2 == 0;
        case QRMaskPattern.PATTERN001: return i % 2 == 0;
        case QRMaskPattern.PATTERN010: return j % 3 == 0;
        case QRMaskPattern.PATTERN011: return (i + j) % 3 == 0;
        case QRMaskPattern.PATTERN100: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
        case QRMaskPattern.PATTERN101: return (i * j) % 2 + (i * j) % 3 == 0;
        case QRMaskPattern.PATTERN110: return ((i * j) % 2 + (i * j) % 3) % 2 == 0;
        case QRMaskPattern.PATTERN111: return ((i * j) % 3 + (i + j) % 2) % 2 == 0;
        default: throw new Error("bad maskPattern:" + maskPattern);
      }
    },
    getErrorCorrectPolynomial: function (errorCorrectLength) {
      var a = new QRPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i++) {
        a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
      }
      return a;
    },
    getLengthInBits: function (mode, type) {
      if (1 <= type && type < 10) {
        switch (mode) {
          case QRMode.MODE_NUMBER: return 10;
          case QRMode.MODE_ALPHA_NUM: return 9;
          case QRMode.MODE_8BIT_BYTE: return 8;
          case QRMode.MODE_KANJI: return 8;
          default: throw new Error("mode:" + mode);
        }
      } else if (type < 27) {
        switch (mode) {
          case QRMode.MODE_NUMBER: return 12;
          case QRMode.MODE_ALPHA_NUM: return 11;
          case QRMode.MODE_8BIT_BYTE: return 16;
          case QRMode.MODE_KANJI: return 10;
          default: throw new Error("mode:" + mode);
        }
      } else if (type < 41) {
        switch (mode) {
          case QRMode.MODE_NUMBER: return 14;
          case QRMode.MODE_ALPHA_NUM: return 13;
          case QRMode.MODE_8BIT_BYTE: return 16;
          case QRMode.MODE_KANJI: return 12;
          default: throw new Error("mode:" + mode);
        }
      } else {
        throw new Error("type:" + type);
      }
    },
    getLostPoint: function (qrCode) {
      var moduleCount = qrCode.getModuleCount();
      var lostPoint = 0;
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          var sameCount = 0;
          var dark = qrCode.isDark(row, col);
          for (var r = -1; r <= 1; r++) {
            if (row + r < 0 || moduleCount <= row + r) continue;
            for (var c = -1; c <= 1; c++) {
              if (col + c < 0 || moduleCount <= col + c) continue;
              if (r == 0 && c == 0) continue;
              if (dark == qrCode.isDark(row + r, col + c)) sameCount++;
            }
          }
          if (sameCount > 5) lostPoint += (3 + sameCount - 5);
        }
      }
      return lostPoint;
    }
  };

  var QRMath = {
    glog: function (n) {
      if (n < 1) throw new Error("glog(" + n + ")");
      return QRMath.LOG_TABLE[n];
    },
    gexp: function (n) {
      while (n < 0) n += 255;
      while (n >= 256) n -= 255;
      return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
  };

  for (var i = 0; i < 8; i++) QRMath.EXP_TABLE[i] = 1 << i;
  for (var i = 8; i < 256; i++) QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  for (var i = 0; i < 255; i++) QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;

  function QRPolynomial(num, shift) {
    if (num.length == undefined) throw new Error(num.length + "/" + shift);
    var offset = 0;
    while (offset < num.length && num[offset] == 0) offset++;
    this.num = new Array(num.length - offset + shift);
    for (var i = 0; i < num.length - offset; i++) this.num[i] = num[i + offset];
  }

  QRPolynomial.prototype = {
    get: function (index) { return this.num[index]; },
    getLength: function () { return this.num.length; },
    multiply: function (e) {
      var num = new Array(this.getLength() + e.getLength() - 1);
      for (var i = 0; i < this.getLength(); i++) {
        for (var j = 0; j < e.getLength(); j++) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }
      return new QRPolynomial(num, 0);
    },
    mod: function (e) {
      if (this.getLength() - e.getLength() < 0) return this;
      var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
      var num = new Array(this.getLength());
      for (var i = 0; i < this.getLength(); i++) num[i] = this.get(i);
      for (var i = 0; i < e.getLength(); i++) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
      }
      return new QRPolynomial(num, 0).mod(e);
    }
  };

  function QRRSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  QRRSBlock.RS_BLOCK_TABLE = [
    [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], // 1
    [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], // 2
    [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], // 3
    [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], // 4
    [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], // 5
    [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], // 6
    [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], // 7
    [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], // 8
    [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], // 9
    [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16] // 10
  ];

  QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectionLevel) {
    var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectionLevel);
    if (rsBlock == undefined) throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel);
    var length = rsBlock.length / 3;
    var list = [];
    for (var i = 0; i < length; i++) {
      var count = rsBlock[i * 3 + 0];
      var totalCount = rsBlock[i * 3 + 1];
      var dataCount = rsBlock[i * 3 + 2];
      for (var j = 0; j < count; j++) {
        list.push(new QRRSBlock(totalCount, dataCount));
      }
    }
    return list;
  };

  QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectionLevel) {
    switch (errorCorrectionLevel) {
      case QRErrorCorrectLevel.L: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectLevel.M: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectLevel.Q: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectLevel.H: return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default: return undefined;
    }
  };

  function QRBitBuffer() {
    this.buffer = [];
    this.length = 0;
  }
  QRBitBuffer.prototype = {
    get: function (index) {
      var bufIndex = Math.floor(index / 8);
      return ((this.buffer[bufIndex] >>> (7 - index % 8)) & 1) == 1;
    },
    put: function (num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) == 1);
      }
    },
    getLengthInBits: function () { return this.length; },
    putBit: function (bit) {
      var bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) this.buffer.push(0);
      if (bit) this.buffer[bufIndex] |= (0x80 >>> (this.length % 8));
      this.length++;
    }
  };

  return {
    generateMatrix: function (text, eccLevel) {
      // Use Error Correction Level H (30% ECC capability) for reliable center logo embedding
      var ecc = (eccLevel === 'M') ? 0 : (eccLevel === 'L') ? 1 : (eccLevel === 'Q') ? 3 : 2;
      var qr = new QRCodeModel(0, ecc);
      qr.addData(text);
      qr.make();
      var size = qr.getModuleCount();
      var matrix = [];
      for (var r = 0; r < size; r++) {
        var row = [];
        for (var c = 0; c < size; c++) {
          row.push(qr.isDark(r, c) ? 1 : 0);
        }
        matrix.push(row);
      }
      return { matrix: matrix, size: size };
    }
  };
})();

// App Controller State
const State = {
  baseUrl: 'https://discord.gg/midnightmass',
  utmSource: 'street_sticker',
  utmMedium: 'qr_code',
  utmCampaign: 'midnight_mass_sanctuary',
  customUrl: '',
  
  colorPreset: 'gothic_tri_color',
  bgColor: '#0B0B0B',
  fgColor1: '#E11D48',
  fgColor2: '#8B5CF6',
  fgColor3: '#2563EB',
  
  moduleShape: 'gothic_diamond', // 'square', 'rounded', 'gothic_diamond', 'cross'
  eyeShape: 'gothic_arch', // 'square', 'rounded', 'gothic_arch'
  logoType: 'brand_logo_300', // default to official 300x300 brand logo emblem
  brandLogoImg: null,
  customLogoImg: null,
  
  fontStyle: 'classic',
  logoTheme: 'brand_logo_300',
  moodTheme: 'quiet',
  iconStyle: 'thin'
};

// SVG Icon Templates
const Icons = {
  brand_logo_300: `<svg viewBox="0 0 24 24"><path d="M12 2L15 8L22 9L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9L9 8L12 2Z"/></svg>`,
  candle: `<svg viewBox="0 0 24 24"><path d="M12 2C11.5 3.5 10 5 10 7C10 8.7 11.3 10 13 10C14.7 10 16 8.7 16 7C16 5 14.5 3.5 14 2C13.5 3 12.5 3 12 2ZM9 11H15V22H9V11Z"/></svg>`,
  gothic_m: `<svg viewBox="0 0 24 24"><path d="M4 20V4L9 14L12 8L15 14L20 4V20H17V9.5L14 15.5H10L7 9.5V20H4Z"/></svg>`,
  cross: `<svg viewBox="0 0 24 24"><path d="M11 2H13V8H19V10H13V22H11V10H5V8H11V2Z"/></svg>`
};

// Initialize Application
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Preload 300x300 Brand Logo Image
    const img = new Image();
    img.onload = () => {
      State.brandLogoImg = img;
      renderQR();
      renderPosterPreview();
    };
    img.src = 'assets/qr_logo_300x300.png';

    setupEventListeners();
    updateFullUrl();
    renderQR();
    renderPosterPreview();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MidnightQR, State };
}

function setupEventListeners() {
  // Navigation Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      
      const tabId = btn.getAttribute('data-tab');
      btn.classList.add('active');
      document.getElementById(tabId)?.classList.remove('hidden');
    });
  });

  // Customizer Controls (Fonts, Logo, Mood)
  document.getElementById('fontSelector')?.addEventListener('change', (e) => {
    State.fontStyle = e.target.value;
    if (State.fontStyle === 'softer') {
      document.body.classList.add('font-softer');
    } else {
      document.body.classList.remove('font-softer');
    }
  });

  document.getElementById('logoSelector')?.addEventListener('change', (e) => {
    State.logoTheme = e.target.value;
    const emblemHeader = document.getElementById('headerSacredEmblem');
    if (emblemHeader && Icons[State.logoTheme]) {
      emblemHeader.innerHTML = Icons[State.logoTheme];
    }
    State.logoType = State.logoTheme;
    renderQR();
    renderPosterPreview();
  });

  document.getElementById('moodSelector')?.addEventListener('change', (e) => {
    State.moodTheme = e.target.value;
    document.body.classList.remove('mood-heavy', 'mood-cinematic');
    if (State.moodTheme === 'heavy') document.body.classList.add('mood-heavy');
    if (State.moodTheme === 'cinematic') document.body.classList.add('mood-cinematic');
  });

  // URL & UTM Inputs
  ['baseUrlInput', 'utmSourceSelect', 'utmMediumInput', 'utmCampaignInput', 'customUrlInput'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      updateFullUrl();
      renderQR();
      renderPosterPreview();
    });
  });

  // Custom Logo Upload
  document.getElementById('customLogoInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const customImg = new Image();
        customImg.onload = () => {
          State.customLogoImg = customImg;
          State.logoType = 'custom';
          renderQR();
          renderPosterPreview();
        };
        customImg.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // QR Shape & Color controls
  document.getElementById('moduleShapeSelect')?.addEventListener('change', (e) => {
    State.moduleShape = e.target.value;
    renderQR();
  });

  document.getElementById('colorPresetSelect')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'gothic_tri_color') {
      State.bgColor = '#0B0B0B';
      State.fgColor1 = '#E11D48';
      State.fgColor2 = '#8B5CF6';
      State.fgColor3 = '#2563EB';
    } else if (val === 'neon_purple_blue') {
      State.bgColor = '#0B0B0B';
      State.fgColor1 = '#8B5CF6';
      State.fgColor2 = '#2563EB';
      State.fgColor3 = '#06B6D4';
    } else if (val === 'cyan_abyss') {
      State.bgColor = '#121119';
      State.fgColor1 = '#06B6D4';
      State.fgColor2 = '#2563EB';
      State.fgColor3 = '#8B5CF6';
    } else if (val === 'crimson_blood') {
      State.bgColor = '#0B0B0B';
      State.fgColor1 = '#E11D48';
      State.fgColor2 = '#9B1B1B';
      State.fgColor3 = '#8B5CF6';
    }
    renderQR();
  });

  // Download & Print Actions
  document.getElementById('downloadPngBtn')?.addEventListener('click', downloadHighResPNG);
  document.getElementById('downloadSvgBtn')?.addEventListener('click', downloadSVG);
  document.getElementById('printPosterBtn')?.addEventListener('click', () => window.print());
  document.getElementById('copyUrlBtn')?.addEventListener('click', copyFinalUrl);
}

function updateFullUrl() {
  const custom = document.getElementById('customUrlInput')?.value.trim();
  if (custom) {
    State.fullUrl = custom;
  } else {
    const base = document.getElementById('baseUrlInput')?.value.trim() || State.baseUrl;
    const source = document.getElementById('utmSourceSelect')?.value || State.utmSource;
    const medium = document.getElementById('utmMediumInput')?.value || State.utmMedium;
    const campaign = document.getElementById('utmCampaignInput')?.value || State.utmCampaign;
    
    State.fullUrl = `${base}?utm_source=${encodeURIComponent(source)}&utm_medium=${encodeURIComponent(medium)}&utm_campaign=${encodeURIComponent(campaign)}`;
  }

  const urlDisplay = document.getElementById('finalUrlDisplay');
  if (urlDisplay) urlDisplay.textContent = State.fullUrl;
}

function copyFinalUrl() {
  navigator.clipboard.writeText(State.fullUrl).then(() => {
    const btn = document.getElementById('copyUrlBtn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Copied to Codex Clipboard!';
      setTimeout(() => btn.innerHTML = orig, 2000);
    }
  });
}

// Master Canvas QR Renderer (Scannable ISO 18004 Architecture)
function renderQR() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const canvasSize = 800; // High resolution crisp rendering
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  const urlToEncode = State.fullUrl || State.baseUrl;
  const { matrix, size } = MidnightQR.generateMatrix(urlToEncode, 'H');
  const padding = 54;
  const cellSize = (canvasSize - padding * 2) / size;

  // Background Fill (Void Black)
  ctx.fillStyle = State.bgColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // Background Outer Neon Border Frame
  ctx.strokeStyle = State.fgColor2 || '#8B5CF6';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, canvasSize - 28, canvasSize - 28);

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(22, 22, canvasSize - 44, canvasSize - 44);

  // Gradient for QR Code Modules (Multi-stop Tri-Color Neon Gradient)
  const grad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
  grad.addColorStop(0, State.fgColor1 || '#E11D48');
  if (State.fgColor3) {
    grad.addColorStop(0.5, State.fgColor2 || '#8B5CF6');
    grad.addColorStop(1, State.fgColor3 || '#2563EB');
  } else {
    grad.addColorStop(1, State.fgColor2 || '#2563EB');
  }

  ctx.fillStyle = grad;

  // Helper: Detect if a module belongs to the 3 main Finder Patterns (7x7 corners)
  function isFinderPattern(r, c) {
    if (r < 7 && c < 7) return true; // Top-Left
    if (r < 7 && c >= size - 7) return true; // Top-Right
    if (r >= size - 7 && c < 7) return true; // Bottom-Left
    return false;
  }

  // Render QR Modules
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;

        // Keep Finder Patterns crisp and solid for 100% phone camera decode reliability
        if (isFinderPattern(r, c) || State.moduleShape === 'square') {
          ctx.fillRect(x + 0.2, y + 0.2, cellSize - 0.4, cellSize - 0.4);
        } else if (State.moduleShape === 'gothic_diamond') {
          ctx.beginPath();
          ctx.moveTo(x + cellSize / 2, y);
          ctx.lineTo(x + cellSize, y + cellSize / 2);
          ctx.lineTo(x + cellSize / 2, y + cellSize);
          ctx.lineTo(x, y + cellSize / 2);
          ctx.closePath();
          ctx.fill();
        } else if (State.moduleShape === 'rounded') {
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (State.moduleShape === 'cross') {
          const w = cellSize * 0.38;
          ctx.fillRect(x + (cellSize - w) / 2, y, w, cellSize);
          ctx.fillRect(x, y + (cellSize - w) / 2, cellSize, w);
        }
      }
    }
  }

  // Draw Center Logo Emblem (Calibrated with ECC Level H for 100% scan capability)
  if (State.logoType !== 'none') {
    const centerModules = Math.floor(size * 0.26); // Safe logo zone (well within 30% ECC limit)
    const centerSize = centerModules * cellSize;
    const centerX = (canvasSize - centerSize) / 2;
    const centerY = (canvasSize - centerSize) / 2;

    // Protective Background Circle
    ctx.fillStyle = State.bgColor;
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, centerSize / 2 + 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = State.fgColor2 || '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.stroke();

    if (State.logoType === 'brand_logo_300' && State.brandLogoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, centerSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(State.brandLogoImg, centerX, centerY, centerSize, centerSize);
      ctx.restore();
    } else if (State.logoType === 'custom' && State.customLogoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, centerSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(State.customLogoImg, centerX, centerY, centerSize, centerSize);
      ctx.restore();
    } else {
      // Draw Vector Emblem
      ctx.fillStyle = State.fgColor2 || '#8B5CF6';
      ctx.shadowColor = State.fgColor1 || '#E11D48';
      ctx.shadowBlur = 10;

      ctx.save();
      ctx.translate(canvasSize / 2 - 24, canvasSize / 2 - 24);
      ctx.scale(2, 2);

      const path = new Path2D();
      if (State.logoType === 'candle') {
        path.addPath(new Path2D("M12 2C11.5 3.5 10 5 10 7C10 8.7 11.3 10 13 10C14.7 10 16 8.7 16 7C16 5 14.5 3.5 14 2C13.5 3 12.5 3 12 2ZM9 11H15V22H9V11Z"));
      } else if (State.logoType === 'gothic_m') {
        path.addPath(new Path2D("M4 20V4L9 14L12 8L15 14L20 4V20H17V9.5L14 15.5H10L7 9.5V20H4Z"));
      } else {
        path.addPath(new Path2D("M11 2H13V8H19V10H13V22H11V10H5V8H11V2Z"));
      }
      ctx.fill(path);
      ctx.restore();
      ctx.shadowBlur = 0;
    }
  }
}

// Render Printable Poster Preview Frame
function renderPosterPreview() {
  const posterQrContainer = document.getElementById('posterQrFrame');
  if (!posterQrContainer) return;

  const canvas = document.getElementById('qrCanvas');
  if (canvas) {
    posterQrContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.style.width = '240px';
    img.style.height = '240px';
    posterQrContainer.appendChild(img);
  }

  const posterUrlTag = document.getElementById('posterUrlTag');
  if (posterUrlTag) posterUrlTag.textContent = (State.fullUrl || State.baseUrl).replace(/^https?:\/\//, '');
}

// Action: Download High-Res PNG (3000x3000px)
function downloadHighResPNG() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = 3000;
  exportCanvas.height = 3000;
  const ctx = exportCanvas.getContext('2d');

  // Draw scaled QR onto export canvas
  ctx.drawImage(canvas, 0, 0, 3000, 3000);

  const link = document.createElement('a');
  link.download = `MidnightMass_Sacred_QR_${Date.now()}.png`;
  link.href = exportCanvas.toDataURL('image/png');
  link.click();
}

// Action: Download Vector SVG
function downloadSVG() {
  const { matrix, size } = MidnightQR.generateMatrix(State.fullUrl || State.baseUrl, 'H');
  const cellSize = 12;
  const padding = 48;
  const totalSize = size * cellSize + padding * 2;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`;
  svgContent += `<rect width="100%" height="100%" fill="${State.bgColor}"/>`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${State.fgColor2 || '#8B5CF6'}"/>`;
      }
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `MidnightMass_Sacred_QR_${Date.now()}.svg`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
