// 사용자 정의 항성계 지원: planets.json 또는 argv로 입력 가능
let planets = [
    { name: 'Mercuria', distance: 0.4, diameter: 4879 },
    { name: 'Venusia', distance: 0.7, diameter: 12104 },
    { name: 'Earthia', distance: 1.0, diameter: 12742 },
    { name: 'Marsia', distance: 1.5, diameter: 6779 },
];
const fs = require('fs');
// 입력 파일(json) 또는 argv 파싱
if (process.argv[2]) {
    try {
        if (process.argv[2].endsWith('.json')) {
            const data = fs.readFileSync(process.argv[2], 'utf8');
            planets = JSON.parse(data);
        } else {
            // 예: node ... '[{"name":"A","distance":0.2,"diameter":1000},...]'
            planets = JSON.parse(process.argv[2]);
        }
    } catch (e) {
        console.error('[입력 오류]', e.message);
        process.exit(1);
    }
}
const sortedPlanets = [...planets].sort((a, b) => a.distance - b.distance);


const fs = require('fs');

/**
 * 행성 정렬 SVG 시각화 생성
 * @param {Planet[]} planetList - 거리순 정렬된 행성 배열
 * @param {string} [filePath] - 저장 경로 (생략 시 반환만)
 * @returns {string} SVG 문자열
 */
function generatePlanetarySVG(planetList, filePath) {
    // SVG 캔버스 크기
    const width = 900;
    const height = 220;
    const margin = 80;
    const sunX = margin;
    const centerY = height / 2;
    // 거리 최대값
    const maxDist = Math.max(...planetList.map(p => p.distance));
    // 행성별 색상
    const colors = ['#f5c542', '#e08b2f', '#4fa3e3', '#b84fe3', '#6ee7b7', '#f472b6'];
    // 행성별 X 좌표 계산
    const getX = d => sunX + (width - 2 * margin) * (d / maxDist);
    // 행성별 반지름 (시각화용, 실제 비율 아님)
    const getR = d => 12 + 18 * (d / maxDist);
    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    // 태양
    svg += `<circle cx="${sunX}" cy="${centerY}" r="36" fill="#ffe066" stroke="#e6b800" stroke-width="4" />\n`;
    svg += `<text x="${sunX}" y="${centerY - 48}" text-anchor="middle" font-size="20" fill="#e6b800">☀️ Sun</text>\n`;
    // 행성 및 그림자
    planetList.forEach((p, i) => {
        const x = getX(p.distance);
        const r = Math.max(10, Math.min(32, p.diameter / 600));
        // 과학적 그림자 투영: 태양~행성~뒤쪽, 그림자 길이 = (행성 반지름 / 태양 반지름) * (행성-태양 거리) * 계수
        const sunRadius = 36;
        const shadowLength = ((r / sunRadius) * (x - sunX)) * 2.2 + 40;
        const shadowRx = Math.max(18, shadowLength);
        const shadowRy = r * 0.7;
        svg += `<ellipse cx="${x + shadowRx}" cy="${centerY}" rx="${shadowRx}" ry="${shadowRy}" fill="#222" fill-opacity="0.18" />\n`;
        // 행성
        svg += `<circle cx="${x}" cy="${centerY}" r="${r}" fill="${colors[i % colors.length]}" stroke="#333" stroke-width="2" />\n`;
        svg += `<text x="${x}" y="${centerY + r + 20}" text-anchor="middle" font-size="15" fill="#222">${p.name}</text>\n`;
        svg += `<text x="${x}" y="${centerY - r - 10}" text-anchor="middle" font-size="12" fill="#555">${p.distance} AU</text>\n`;
    });
    svg += '</svg>\n';
    if (filePath) {
        try {
            fs.writeFileSync(filePath, svg, 'utf8');
            console.log(`\x1b[32m[SVG] 행성 정렬 시각화가 저장됨: ${filePath}\x1b[0m`);
        } catch (e) {
            console.error(`\x1b[31m[SVG 저장 오류]\x1b[0m`, e.message);
        }
    }
    return svg;
}

// 메인 실행
(function main() {
    try {
    const results = calculateLightIntensity(planets);
        printCelestialResults(results);
        // SVG 시각화 생성 및 저장
        generatePlanetarySVG(sortedPlanets, __dirname + '/Lumoria-Planetary-Alignment.svg');
    } catch (err) {
        console.error('\x1b[31m[오류]\x1b[0m', err.message);
    }
})();
// Planet objects with their name, distance from Lumoria, and size
const lumoriaPlanets = [
    { name: "Mercuria", distance: 0.4, size: 4879 },
    { name: "Earthia", distance: 1, size: 12742 },
    { name: "Venusia", distance: 0.7, size: 12104 },
    { name: "Marsia", distance: 1.5, size: 6779 }
];



// Takes an array of planets and the current index for the planet being evaluated
// and returns the number of planets that cast a shadow on the current planet
function getShadowCount(planets, currentIndex) {
    // Slice the array up to the current index, filter the planets that are larger than the current planet, and return the length of the resulting array
    return planets.slice(0, currentIndex)
        .filter(planet => planet.size > planets[currentIndex].size)
        .length;
}

// Takes the current index and the number of shadows cast on the planet
// and returns the light intensity of the planet
function getLightIntensity(i, shadowCount) {
    /** 
     * RULES
     * - If a smaller planet is behind a larger planet (relative to the Lumorian Sun), it will be in the shadow and will receive no light (`None`).
     * - If a larger planet is behind a smaller planet (relative to the Lumorian Sun), it will have `Partial` light.
     * - If a planet is in the shadow of multiple planets, it will be marked as `None (Multiple Shadows)`.
     * - If two planets are of similar size and are near each other in alignment, they might partially eclipse each other, but for simplicity, you can consider them both to receive full light.
     **/
    if (i === 0) return 'Full';
    if (shadowCount === 1) return 'None';
    if (shadowCount > 1) return 'None (Multiple Shadows)';
    return 'Partial';
}

// Calculates the light intensity of each planet by seeing how many shadows are cast on it from other planets
function calculateLightIntensity(planets) {
    // Map over the array of planets, calculate the shadow count for each planet, 
    // and return an object with the planet name and its light intensity
    return planets.map((planet, i) => {
        const shadowCount = getShadowCount(planets, i);
        let lightIntensity = getLightIntensity(i, shadowCount);
        return { name: planet.name, light: lightIntensity };
    });
}

module.exports = { calculateLightIntensity };

/**
 * 콘솔에 아름다운 루모리아 성계 광량 결과 출력
 * @param {Array<{name: string, light: string}>} results
 */
function printCelestialResults(results) {
    const title = '★ 루모리아 성계 태양광 강도 분석 ★';
    const line = '═'.repeat(44);
    console.log('\x1b[36m' + line + '\x1b[0m');
    console.log(`\x1b[1;33m${title}\x1b[0m`);
    console.log('\x1b[36m' + line + '\x1b[0m');
    console.log('행성      광량');
    console.log('-------------------');
    results.forEach(({ name, light }) => {
        let symbol = light === 'Full' ? '☀️' : (light.startsWith('Partial') ? '🌗' : '🌑');
        let color = light === 'Full' ? '\x1b[33m' : (light.startsWith('Partial') ? '\x1b[35m' : '\x1b[34m');
        console.log(`${color}${name.padEnd(9)} ${symbol} ${light}\x1b[0m`);
    });
    console.log('\x1b[36m' + line + '\x1b[0m');
    console.log('☀️ Full: 그림자 없음  🌗 Partial: 부분 그림자  🌑 None: 다중 그림자');
}

// Sort the array of planets by distance
// (중복 선언 제거됨)

// Log the light intensity of each planet to the console
// (중복 출력 제거됨)
