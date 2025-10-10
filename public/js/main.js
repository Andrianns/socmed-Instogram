(function () {
  const LIKE_ENDPOINT = '/api/posts';

  const updateButtonState = (button, liked) => {
    if (liked) {
      button.classList.add('btn-success', 'text-white');
      button.classList.remove('btn-outline-success', 'btn-danger');
      button.dataset.liked = 'true';
      const label = button.querySelector('span');
      if (label) {
        label.textContent = 'Liked';
      }
    } else {
      button.classList.remove('btn-success', 'text-white', 'btn-danger');
      button.classList.add('btn-outline-success');
      button.dataset.liked = 'false';
      const label = button.querySelector('span');
      if (label) {
        label.textContent = 'Like';
      }
    }
  };

  const applyHoverState = (button, hovering) => {
    if (button.dataset.liked !== 'true') {
      return;
    }

    const label = button.querySelector('span');
    if (hovering) {
      button.classList.remove('btn-success');
      button.classList.add('btn-danger');
      if (label) {
        label.textContent = 'Unlike';
      }
    } else {
      updateButtonState(button, true);
    }
  };

  const updateLikeCount = (postId, totalLike) => {
    const badge = document.querySelector(
      `[data-like-count-id="${postId}"] [data-like-count]`
    );
    if (badge) {
      badge.textContent = totalLike;
    }
  };

  const sendLikeRequest = async (postId, method) => {
    const response = await fetch(`${LIKE_ENDPOINT}/${postId}/like`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error.message || 'Failed to update like';
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    return response.json();
  };

  const handleLikeClick = async (event) => {
    const button = event.currentTarget;
    if (button.dataset.loading === 'true') {
      return;
    }

    const postId = button.dataset.postId;
    if (!postId) {
      return;
    }

    const liked = button.dataset.liked === 'true';
    const method = liked ? 'DELETE' : 'POST';

    try {
      button.dataset.loading = 'true';
      const payload = await sendLikeRequest(postId, method);
      updateLikeCount(postId, payload.totalLike);
      updateButtonState(button, !liked);
    } catch (error) {
      if (error.status === 400) {
        // If the server reports out-of-sync state, refresh UI after re-fetching status
        updateButtonState(button, !liked);
      } else {
        console.error(error);
      }
    } finally {
      delete button.dataset.loading;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const likeButtons = document.querySelectorAll('[data-like-button="true"]');
    likeButtons.forEach((button) => {
      updateButtonState(button, button.dataset.liked === 'true');
      button.addEventListener('click', handleLikeClick);
      button.addEventListener('mouseenter', () =>
        applyHoverState(button, true)
      );
      button.addEventListener('mouseleave', () =>
        applyHoverState(button, false)
      );
    });
  });
})();
