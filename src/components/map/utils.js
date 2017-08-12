export function updatePercentiles(featureCollection, accessor) {
  const {features} = featureCollection;
  features.forEach(f => {
    const value = accessor(f);
    f.properties.value = value;
  });
}
