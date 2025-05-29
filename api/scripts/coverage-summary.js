#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function calculateOverallCoverage() {
  try {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');

    if (!fs.existsSync(coveragePath)) {
      console.log('❌ Файл coverage-summary.json не найден. Запустите сначала npm run test:cov');
      process.exit(1);
    }

    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverageData.total;

    const statements = total.statements.pct;
    const branches = total.branches.pct;
    const functions = total.functions.pct;
    const lines = total.lines.pct;

    const overallCoverage = ((statements + branches + functions + lines) / 4).toFixed(2);

    const getColorCode = (percentage) => {
      if (percentage >= 80) return '\x1b[32m';
      if (percentage >= 60) return '\x1b[33m';
      return '\x1b[31m';
    };

    const resetColor = '\x1b[0m';
    const boldColor = '\x1b[1m';
    const colorCode = getColorCode(parseFloat(overallCoverage));

    console.log('\n' + '='.repeat(80));
    console.log(`${boldColor}📊 ОБЩИЙ ОТЧЕТ О ПОКРЫТИИ ТЕСТАМИ${resetColor}`);
    console.log('='.repeat(80));

    console.log(`📝 Statements: ${colorCode}${statements}%${resetColor}`);
    console.log(`🔀 Branches:   ${colorCode}${branches}%${resetColor}`);
    console.log(`⚡ Functions:   ${colorCode}${functions}%${resetColor}`);
    console.log(`📏 Lines:      ${colorCode}${lines}%${resetColor}`);

    console.log('─'.repeat(80));
    console.log(`${boldColor}🎯 ОБЩИЙ ПРОЦЕНТ ПОКРЫТИЯ: ${colorCode}${overallCoverage}%${resetColor}${boldColor}${resetColor}`);
    console.log('='.repeat(80));

    console.log('\n💡 Для детального отчета откройте: coverage/lcov-report/index.html\n');

  } catch (error) {
    console.error('❌ Ошибка при чтении данных покрытия:', error.message);
    process.exit(1);
  }
}

calculateOverallCoverage();
