
// The Clockwork Town of Tempora - Clock Synchronization System
// Fantasy adventure themed Copilot demo
// Language: JavaScript (Node.js)
//
// 콘솔 앱: 템포라 마을의 4개 시계와 대형 시계탑(15:00) 동기화
// 각 시계가 대형 시계탑보다 몇 분 앞섰는지/뒤처졌는지 계산

/**
 * HH:MM 형식의 문자열을 분 단위로 변환
 * @param {string} timeStr - 'HH:MM' 형식
 * @returns {number} 자정 이후 분
 * @throws {Error} 잘못된 형식일 때
 */
function parseTimeToMinutes(timeStr) {
    const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(timeStr);
    if (!match) {
        throw new Error(`잘못된 시간 형식: ${timeStr}`);
    }
    const [, hour, minute] = match;
    return parseInt(hour, 10) * 60 + parseInt(minute, 10);
}

/**
 * 시계와 대형 시계탑의 분 차이 계산
 * @param {string} clockTime - 마을 시계 (HH:MM)
 * @param {string} grandClockTime - 대형 시계탑 (HH:MM)
 * @returns {number} 분 차이 (양수: 앞섬, 음수: 뒤처짐)
 */
function getMinuteDifference(clockTime, grandClockTime) {
    return parseTimeToMinutes(clockTime) - parseTimeToMinutes(grandClockTime);
}

// 메인 실행
(function main() {
    const grandClockTime = '15:00';
    const townClocks = ['14:45', '15:05', '15:00', '14:40'];

    console.log('=== 템포라 마을 시계 동기화 시스템 ===');
    console.log(`대형 시계탑 시간: ${grandClockTime}`);
    console.log('마을 시계 현황:');

    townClocks.forEach((clockTime, idx) => {
        try {
            const diff = getMinuteDifference(clockTime, grandClockTime);
            const status = diff > 0 ? '앞섬' : (diff < 0 ? '뒤처짐' : '동기화됨');
            console.log(`  #${idx + 1} 시계: ${clockTime}  →  ${diff}분 (${status})`);
        } catch (err) {
            console.error(`  #${idx + 1} 시계: 오류 - ${err.message}`);
        }
    });

    console.log('\n※ 양수: 앞섬, 음수: 뒤처짐, 0: 동기화됨');
})();

// Copilot Prompt Example:
// "템포라 마을의 모든 시계가 대형 시계탑과 몇 분 차이 나는지 계산하는 함수를 만들어줘."
