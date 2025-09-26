// 빛 강도 계산 유닛 테스트 (Jest 스타일)
const { calculateLightIntensity } = require('./The-Celestial-Alignment-of-Lumoria');

describe('calculateLightIntensity', () => {
  it('Mercuria: 첫 번째 행성은 항상 Full', () => {
    const planets = [
      { name: 'Mercuria', distance: 0.4, diameter: 4879 },
      { name: 'Venusia', distance: 0.7, diameter: 12104 },
    ];
    const result = calculateLightIntensity(planets);
    expect(result[0].light).toBe('Full');
  });

  it('Venusia: Partial 또는 None 판정', () => {
    const planets = [
      { name: 'Mercuria', distance: 0.4, diameter: 4879 },
      { name: 'Venusia', distance: 0.7, diameter: 12104 },
    ];
    const result = calculateLightIntensity(planets);
    expect(['Partial', 'None']).toContain(result[1].light);
  });

  it('여러 행성: 빛 강도 배열 길이 일치', () => {
    const planets = [
      { name: 'A', distance: 0.1, diameter: 1000 },
      { name: 'B', distance: 0.2, diameter: 2000 },
      { name: 'C', distance: 0.3, diameter: 3000 },
    ];
    const result = calculateLightIntensity(planets);
    expect(result.length).toBe(3);
  });
});
