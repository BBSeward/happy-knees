/*

first, you could just take the min, max of x an y of the forefoot, and that is the center
after a few rotations within that area you could calculate a more
exact center,

1. Compute the Centroid (Geometric Mean)
The simplest guess for a candidate center is the centroid:
​See img
 
Implementation:

typescript
Copy code
function computeCentroid(points: { x: number; y: number }[]): { x: number; y: number } {
  const n = points.length;
  const { x: xSum, y: ySum } = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  return { x: xSum / n, y: ySum / n };
}
This works well if the points are evenly distributed around the circle.
*/