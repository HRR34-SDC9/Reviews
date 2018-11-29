(() => {
  const productNumber = window.location.href.split('/')[window.location.href.split('/').length - 1];
  fetch(`/reviews/${productNumber}`)
    .then(response => response.json()).then(json => {
      const ratings = Array(5).fill(0);
      const newReviews = {};
      json.forEach(review => {
        ratings[review.rating - 1]++;
        newReviews[review.id] = review;
        newReviews[review.id].modifiedKeys = {};
      });
      localStorage.setItem(`trailblazersProduct${productNumber}Reviews`, JSON.stringify({ reviews: newReviews, ratings }));
    });
})();
