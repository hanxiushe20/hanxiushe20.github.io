document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    const currentPath = window.location.pathname;
    const bodyElement = document.body;

    console.log('含羞草在线前端脚本已加载，当前页面路由：', currentPath);

    initMobileNav();
    initStickyHeader();
    highlightActiveNav();

    if (currentPath.includes('videos.html')) {
        initVideoFilterAndSearch();
    } else if (currentPath.includes('video-detail.html')) {
        initVideoDetailInteractions();
    } else if (currentPath.includes('community.html')) {
        initCommunityTabs();
    } else if (currentPath.includes('topic-detail.html')) {
        initTopicReplyFeature();
    } else if (currentPath.includes('upload.html')) {
        initUploadFormHandler();
    } else if (currentPath.includes('contact.html')) {
        initContactFormHandler();
    }

    initCommonInteractions();
});

function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav ul');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

function initStickyHeader() {
    const header = document.querySelector('header');
    let lastScrollTop = 0;

    if (header) {
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 80) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, { passive: true });
    }
}

function highlightActiveNav() {
    const currentFileName = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentFileName || (currentFileName === '' && linkHref === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
        }
    });
}

function initVideoFilterAndSearch() {
    const searchInput = document.getElementById('video-search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const videoCards = document.querySelectorAll('.video-card-item');

    function filterVideos() {
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const category = categoryFilter ? categoryFilter.value : 'all';
        const sortType = sortFilter ? sortFilter.value : 'latest';

        let visibleCount = 0;

        videoCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';
            const cardCategory = card.getAttribute('data-category') || '';

            const matchesKeyword = title.includes(keyword) || desc.includes(keyword);
            const matchesCategory = category === 'all' || cardCategory === category;

            if (matchesKeyword && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        const noResultEl = document.getElementById('no-search-results');
        if (noResultEl) {
            noResultEl.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    if (searchInput) searchInput.addEventListener('input', filterVideos);
    if (categoryFilter) categoryFilter.addEventListener('change', filterVideos);
    if (sortFilter) sortFilter.addEventListener('change', filterVideos);
}

function initVideoDetailInteractions() {
    const likeBtn = document.getElementById('video-like-btn');
    const likeCountSpan = document.getElementById('video-like-count');
    const favoriteBtn = document.getElementById('video-favorite-btn');
    const commentForm = document.getElementById('video-comment-form');
    const commentList = document.getElementById('video-comment-list');

    if (likeBtn && likeCountSpan) {
        let isLiked = false;
        let count = parseInt(likeCountSpan.textContent) || 128;

        likeBtn.addEventListener('click', function() {
            if (!isLiked) {
                count++;
                likeBtn.classList.add('liked');
                likeBtn.style.color = '#ff4757';
                isLiked = true;
            } else {
                count--;
                likeBtn.classList.remove('liked');
                likeBtn.style.color = '';
                isLiked = false;
            }
            likeCountSpan.textContent = count;
        });
    }

    if (favoriteBtn) {
        let isFavorited = false;
        favoriteBtn.addEventListener('click', function() {
            isFavorited = !isFavorited;
            if (isFavorited) {
                favoriteBtn.textContent = '已收藏';
                favoriteBtn.classList.add('favorited');
                showToast('收藏成功，可在用户中心随时查看');
            } else {
                favoriteBtn.textContent = '收藏视频';
                favoriteBtn.classList.remove('favorited');
                showToast('已取消收藏');
            }
        });
    }

    if (commentForm && commentList) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const textarea = commentForm.querySelector('textarea');
            const content = textarea.value.trim();

            if (!content) {
                showToast('评论内容不能为空！');
                return;
            }

            if (content.length < 5) {
                showToast('多写几个字吧，和大家交流一下心得～');
                return;
            }

            const newCommentItem = document.createElement('div');
            newCommentItem.className = 'comment-item';
            newCommentItem.innerHTML = `
                <div class="comment-author">
                    <span class="author-name">我（当前用户）</span>
                    <span class="comment-time">刚刚</span>
                </div>
                <p class="comment-text">${escapeHtml(content)}</p>
                <div class="comment-actions">
                    <button type="button" class="btn-text-action">点赞 (0)</button>
                </div>
            `;

            commentList.prepend(newCommentItem);
            textarea.value = '';
            showToast('发布评论成功！');
        });
    }
}

function initCommunityTabs() {
    const tabButtons = document.querySelectorAll('.community-tab-btn');
    const tabContents = document.querySelectorAll('.community-tab-pane');

    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');

                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(pane => pane.classList.remove('active'));

                this.classList.add('active');
                const targetPane = document.getElementById(targetTab);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }
}

function initTopicReplyFeature() {
    const replyForm = document.getElementById('topic-reply-form');
    const replyList = document.getElementById('topic-reply-list');

    if (replyForm && replyList) {
        replyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const textarea = replyForm.querySelector('textarea');
            const replyText = textarea.value.trim();

            if (!replyText) {
                showToast('回帖内容不能为空');
                return;
            }

            const newReply = document.createElement('div');
            newReply.className = 'reply-item';
            newReply.innerHTML = `
                <div class="reply-user-info">
                    <strong>热心草友</strong>
                    <span class="reply-date">刚刚</span>
                </div>
                <div class="reply-content">
                    <p>${escapeHtml(replyText)}</p>
                </div>
            `;

            replyList.appendChild(newReply);
            textarea.value = '';
            showToast('回复发表成功！');
        });
    }
}

function initUploadFormHandler() {
    const uploadForm = document.getElementById('video-upload-form');
    const fileInput = document.getElementById('video-file');
    const dropZone = document.getElementById('upload-drop-zone');

    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const titleInput = document.getElementById('upload-title');

            if (!titleInput || !titleInput.value.trim()) {
                showToast('请填写视频标题！');
                return;
            }

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = '正在上传（0%）...';

                let progress = 0;
                const interval = setInterval(function() {
                    progress += 20;
                    if (progress <= 100) {
                        submitBtn.textContent = `正在上传（${progress}%）...`;
                    } else {
                        clearInterval(interval);
                        showToast('视频上传成功，后台正在转码压制，审核通过后公开显示！');
                        setTimeout(() => {
                            window.location.href = 'videos.html';
                        }, 1500);
                    }
                }, 400);
            }
        });
    }

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                const fileName = e.dataTransfer.files[0].name;
                const promptText = dropZone.querySelector('p');
                if (promptText) {
                    promptText.textContent = `已选择文件: ${fileName}`;
                }
            }
        });
    }
}

function initContactFormHandler() {
    const contactForm = document.getElementById('contact-us-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('contact-email').value.trim();
            const message = document.getElementById('contact-message').value.trim();

            if (!email || !message) {
                showToast('请完整填写邮箱和留言内容');
                return;
            }

            showToast('留言已成功提交，站长会在 24 小时内处理并回复，感谢对含羞草在线的支持！');
            contactForm.reset();
        });
    }
}

function initCommonInteractions() {
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach(link => {
        if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}





    // 使用安全的方式动态添加样式
    const styleElem = document.createElement('style');
    styleElem.innerHTML = `
        .ad { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: #fff; overflow: hidden; clear: both; border-radius: 6px; margin: 0 0 10px 0; text-align: center; padding: 10px; }
        .ad-ti { font-size: 24px; margin: 5px 0 10px 0; color: #333; background: #FFE4E1; padding: 6px; border-radius: 60px; }
        .ad li { width: 100%; list-style: none; margin-bottom: 5px; }
        .ad a.myButton { display: flex; align-items: center; justify-content: center; width: 80vw; margin: auto; height: 55px; color: #fff; background: #01AAED; font-size: 3vw; text-decoration: none; border-radius: 3px; padding: 0 20px; transition: background-color .3s; box-sizing: border-box; overflow: hidden; }
        .nav-icon { height: 80%; max-height: 30px; width: auto; flex-shrink: 0; }
        .ad a.myButton:hover { background: #FFE4E1; color: #333; }
        #fullScreenImage { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; height: 100%; object-fit: cover; z-index: 9999; background-color: rgba(192,192,192,1.9); }
        @media(max-width:600px) {
            .ad a.myButton { height: 48px; width: 80vw; font-size: 3.6vw; }
            .nav-icon { height: 75%; max-height: 38px; }
            .ad-ti { font-size: 4.5vw; }
        }
    `;
    document.head.appendChild(styleElem);

    const adContainer = document.createElement('div');
    adContainer.className = 'ad';
    adContainer.innerHTML = `
        <h2 class="ad-ti">超级精品联盟</h2>
        <ul>
            <li><a class="myButton" href="https://99.loooo.fun" rel="nofollow" target="_blank"><img src="/tu2/lo.webp" class="nav-icon">➦</a></li>
            <li><a class="myButton" href="https://haijiao1.aa545.club" rel="nofollow" target="_blank"><img src="/tu2/hai.webp" class="nav-icon">➦</a></li>
            <li><a class="myButton" href="https://hanxiu.mm545.club" rel="nofollow" target="_blank"><img src="/tu2/han.webp" class="nav-icon">➦</a></li>
        </ul>
    `;
    document.body.appendChild(adContainer);

    var img = document.createElement("img");
    img.id = "fullScreenImage";
    document.body.appendChild(img);

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

