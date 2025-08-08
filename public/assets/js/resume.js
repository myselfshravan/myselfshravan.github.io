document.addEventListener('DOMContentLoaded', function () {
  fetch('assets/config.json')
    .then((response) => response.json())
    .then((config) => {
      const downloadButton = document.getElementById('downloadButton');
      downloadButton.addEventListener('click', () => {
        window.open(config.resumeUrl, '_blank');
      });
    })
    .catch((error) => console.error('Error fetching resume URL:', error));
});
