// プロジェクトデータをJSONから読み込んで表示

let projectsData = {};

// JSONファイルを読み込む
async function loadProjectData() {
    try {
        const response = await fetch('./data/projects.json');
        projectsData = await response.json();
        displayProjectData();
    } catch (error) {
        console.error('プロジェクトデータの読み込みに失敗しました:', error);
        document.querySelector('.project-detail__inner').innerHTML = `
      <div style="text-align: center; padding: 4rem 0;">
        <h2>データの読み込みに失敗しました</h2>
        <p style="margin-top: 1rem;">
          <a href="page_works.html" style="color: #f97316;">作品一覧に戻る</a>
        </p>
      </div>
    `;
    }
}

// URLパラメータからプロジェクトIDを取得
function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// プロジェクトデータを表示
function displayProjectData() {
    const projectId = getProjectId();
    const project = projectsData[projectId];

    if (!project) {
        document.querySelector('.project-detail__inner').innerHTML = `
      <div style="text-align: center; padding: 4rem 0;">
        <h2>プロジェクトが見つかりません</h2>
        <p style="margin-top: 1rem;">
          <a href="page_works.html" style="color: #f97316;">作品一覧に戻る</a>
        </p>
      </div>
    `;
        return;
    }

    // 基本情報
    document.getElementById('project-category').textContent = project.category || '';
    document.getElementById('project-title').textContent = project.title || '';
    document.getElementById('project-description').textContent = project.description || '';
    document.getElementById('project-timeline').textContent = project.timeline || '';
    document.getElementById('project-role').textContent = project.role || '';
    const imageContainer = document.getElementById("project-image");
    if (project.imageLayout) {
        imageContainer.classList.add(`project-detail__image--${project.imageLayout}`);
    }

    if (Array.isArray(project.image)) {
        if (project.imageLayout === 'carousel') {
            imageContainer.appendChild(createProjectImageCarousel(project));
        } else {
            project.image.forEach(src => {
                const img = document.createElement("img");
                img.src = src;
                img.alt = project.title;
                imageContainer.appendChild(img);
            });
        }
    } else {
        const img = document.createElement("img");
        img.src = project.image;
        img.alt = project.title;
        imageContainer.appendChild(img);
    }
    // プロジェクト詳細説明
    if (project.longDescription) {
        document.getElementById('project-long-description').textContent = project.longDescription;
    } else {
        document.getElementById('long-description-section').style.display = 'none';
    }

    // 背景・課題
    if (project.challenge) {
        const challengeText = document.getElementById('project-challenge');
        // 改行を<br>に変換
        challengeText.innerHTML = project.challenge.replace(/\n/g, '<br><br>');
    } else {
        document.getElementById('challenge-section').style.display = 'none';
    }

    // ソリューション
    if (project.solution) {
        document.getElementById('project-solution').textContent = project.solution;
    } else {
        document.getElementById('solution-section').style.display = 'none';
    }

    // 担当業務
    if (project.responsibilities && project.responsibilities.length > 0) {
        const responsibilitiesList = document.getElementById('project-responsibilities');
        project.responsibilities.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            responsibilitiesList.appendChild(li);
        });
    } else {
        document.getElementById('responsibilities-section').style.display = 'none';
    }

    // 使用技術・ツール
    if (project.tools && project.tools.length > 0) {
        const toolsGrid = document.getElementById('project-tools');

        project.tools.forEach(tool => {
            const li = document.createElement('li');
            li.textContent = tool;
            toolsGrid.appendChild(li);
        });
    } else {
        document.getElementById('tools-section').style.display = 'none';
    }

    // 開発環境
    if (project.environment && project.environment.length > 0) {
        const environmentList = document.getElementById('project-environment');
        project.environment.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            environmentList.appendChild(li);
        });
    } else {
        document.getElementById('environment-section').style.display = 'none';
    }

    // 施策・デザインの工夫
    if (project.designDetails && project.designDetails.length > 0) {
        const designContainer = document.getElementById('project-design-details');

        if (project.designDetailsMode === 'notes') {
            renderDesignNotes(designContainer, project.designDetails);
        } else {
            const modal = createDesignModal();
            const map = createPointMap(project, modal);

            if (map) {
                designContainer.classList.add('design-details--point-map');
                designContainer.appendChild(map);
            } else {
                project.designDetails.forEach((detail, index) => {
                    const item = document.createElement('button');
                    item.className = 'design-details__item';
                    item.type = 'button';
                    item.setAttribute('aria-haspopup', 'dialog');

                    const label = document.createElement('span');
                    label.className = 'design-details__label';
                    label.textContent = `POINT ${String(index + 1).padStart(2, '0')}`;
                    item.appendChild(label);

                    if (detail.images && detail.images.length > 0) {
                        const imageWrap = document.createElement('span');
                        imageWrap.className = 'design-details__thumb';

                        const img = document.createElement('img');
                        img.src = detail.images[0];
                        img.alt = '';
                        imageWrap.appendChild(img);
                        item.appendChild(imageWrap);
                    }

                    const title = document.createElement('span');
                    title.className = 'design-details__title';
                    title.textContent = detail.title;
                    item.appendChild(title);

                    item.addEventListener('click', () => {
                        openDesignModal(modal, detail, index);
                    });

                    designContainer.appendChild(item);
                });
            }
        }
    } else {
        document.getElementById('design-section').style.display = 'none';
    }
    // Figma埋め込み
    if (project.figma && project.figma.length > 0) {

        const figmaGallery = document.getElementById('project-figma-gallery');

        project.figma.forEach(item => {

            // wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'figma-item';

            // title
            const title = document.createElement('h3');
            title.className = 'figma-item__title';
            title.textContent = item.title;

            // iframe
            const iframe = document.createElement('iframe');
            iframe.src = item.url;
            iframe.allowFullscreen = true;
            iframe.style.height = item.height;

            // append
            wrapper.appendChild(title);
            wrapper.appendChild(iframe);

            figmaGallery.appendChild(wrapper);

        });

    } else {
        document.getElementById('figma-section').style.display = 'none';
    }
    // 実サイトリンク
    // 実サイトリンク
    if (project.links && project.links.length > 0) {

        const linkContainer =
            document.getElementById('project-link');

        project.links.forEach(link => {

            const a = document.createElement('a');

            a.href = link.url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";

            a.className = 'project-link-btn';

            a.textContent = link.title;

            linkContainer.appendChild(a);

        });

    }

    // 成果
    if (project.results && project.results.length > 0) {
        const resultsList = document.getElementById('project-results');
        project.results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result;
            resultsList.appendChild(li);
        });
    } else {
        document.getElementById('results-section').style.display = 'none';
    }

    // 成果画像
    if (project.resultImages && project.resultImages.length > 0) {
        const resultImagesContainer = document.getElementById('project-result-images');

        project.resultImages.forEach((src, index) => {
            const figure = document.createElement('figure');
            figure.className = 'result-images__item';

            const img = document.createElement('img');
            img.src = src;
            img.alt = `${project.title} 成果画像 ${index + 1}`;

            figure.appendChild(img);
            resultImagesContainer.appendChild(figure);
        });
    } else {
        document.getElementById('result-images-section').style.display = 'none';
    }

    // 学び
    if (project.learnings) {
        document.getElementById('project-learnings').textContent = project.learnings;
    } else {
        document.getElementById('learnings-section').style.display = 'none';
    }

    renderProjectPagination(projectId);
}

function renderProjectPagination(currentProjectId) {
    const pagination = document.getElementById('project-pagination');
    if (!pagination) return;

    const projectIds = Object.keys(projectsData);
    const currentIndex = projectIds.indexOf(currentProjectId);
    if (currentIndex === -1) {
        pagination.style.display = 'none';
        return;
    }

    const prevId = projectIds[currentIndex - 1];
    const nextId = projectIds[currentIndex + 1];

    pagination.innerHTML = '';
    pagination.appendChild(createProjectPaginationItem(prevId, 'prev'));

    const worksLink = document.createElement('a');
    worksLink.href = 'page_works.html';
    worksLink.className = 'project-pagination__list';
    worksLink.textContent = '作品一覧';
    pagination.appendChild(worksLink);

    pagination.appendChild(createProjectPaginationItem(nextId, 'next'));
}

function createProjectPaginationItem(projectId, direction) {
    const label = direction === 'prev' ? '前の作品' : '次の作品';
    const item = projectId ? document.createElement('a') : document.createElement('span');
    item.className = `project-pagination__item project-pagination__item--${direction}`;

    if (!projectId) {
        item.classList.add('is-disabled');
        item.setAttribute('aria-disabled', 'true');
        item.innerHTML = `
            <span class="project-pagination__label">${label}</span>
            <span class="project-pagination__title">ありません</span>
        `;
        return item;
    }

    const project = projectsData[projectId];
    item.href = `page_detail.html?id=${encodeURIComponent(projectId)}`;
    item.innerHTML = `
        <span class="project-pagination__label">${label}</span>
        <span class="project-pagination__title">${project.title || ''}</span>
    `;

    return item;
}

function createProjectImageCarousel(project) {
    const carousel = document.createElement('div');
    carousel.className = 'project-image-carousel';

    const controls = document.createElement('div');
    controls.className = 'project-image-carousel__controls';

    const prev = document.createElement('button');
    prev.className = 'project-image-carousel__arrow';
    prev.type = 'button';
    prev.setAttribute('aria-label', '前の画像へ');
    prev.textContent = '←';

    const tabs = document.createElement('div');
    tabs.className = 'project-image-carousel__tabs';

    const next = document.createElement('button');
    next.className = 'project-image-carousel__arrow';
    next.type = 'button';
    next.setAttribute('aria-label', '次の画像へ');
    next.textContent = '→';

    controls.appendChild(prev);
    controls.appendChild(tabs);
    controls.appendChild(next);
    carousel.appendChild(controls);

    const stage = document.createElement('div');
    stage.className = 'project-image-carousel__stage';

    project.image.forEach((src, index) => {
        const tab = document.createElement('button');
        tab.className = 'project-image-carousel__tab';
        tab.type = 'button';
        tab.textContent = project.imageLabels?.[index] || `IMAGE ${index + 1}`;
        tab.addEventListener('click', () => activateProjectImage(carousel, index));
        tabs.appendChild(tab);

        const slide = document.createElement('figure');
        slide.className = 'project-image-carousel__slide';

        const img = document.createElement('img');
        img.src = src;
        img.alt = `${project.title} ${tab.textContent}の画像`;

        slide.appendChild(img);
        stage.appendChild(slide);
    });

    prev.addEventListener('click', () => {
        const current = Number(carousel.dataset.activeImage || 0);
        activateProjectImage(carousel, (current - 1 + project.image.length) % project.image.length);
    });

    next.addEventListener('click', () => {
        const current = Number(carousel.dataset.activeImage || 0);
        activateProjectImage(carousel, (current + 1) % project.image.length);
    });

    carousel.appendChild(stage);
    activateProjectImage(carousel, 0);

    return carousel;
}

function activateProjectImage(carousel, activeIndex) {
    carousel.dataset.activeImage = String(activeIndex);

    carousel.querySelectorAll('.project-image-carousel__slide').forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.toggleAttribute('hidden', !isActive);
    });

    carousel.querySelectorAll('.project-image-carousel__tab').forEach((tab, index) => {
        const isActive = index === activeIndex;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
    });
}

function renderDesignNotes(container, details) {
    container.classList.add('design-details--point-map');

    const notes = document.createElement('div');
    notes.className = 'point-map__notes';

    details.forEach((detail, index) => {
        const note = document.createElement('article');
        note.className = 'point-map__note';

        const label = document.createElement('p');
        label.className = 'point-map__note-label';
        label.textContent = `NOTE ${String(index + 1).padStart(2, '0')}`;

        const title = document.createElement('h3');
        title.className = 'point-map__note-title';
        title.textContent = detail.title;

        const text = document.createElement('p');
        text.className = 'point-map__note-text';
        text.textContent = detail.description;

        note.appendChild(label);
        note.appendChild(title);
        note.appendChild(text);
        notes.appendChild(note);
    });

    container.appendChild(notes);
}

function createPointMap(project, modal) {
    const fallbackImage = getPointMapFallbackImage(project);
    const hasCustomSections = project.pointSections && project.pointSections.length > 0;

    if (!hasCustomSections && !fallbackImage) {
        return null;
    }

    const map = document.createElement('div');
    map.className = 'point-map';

    const sections = hasCustomSections
        ? project.pointSections
        : [{
            title: project.title,
            label: '作品画像',
            image: fallbackImage,
            points: project.designDetails.map((detail, index) => ({
                detailIndex: index,
                x: detail.point ? detail.point.x : getDefaultPointPosition(index, project.designDetails.length).x,
                y: detail.point ? detail.point.y : getDefaultPointPosition(index, project.designDetails.length).y
            }))
        }];

    if (sections.length > 1) {
        const controls = document.createElement('div');
        controls.className = 'point-map__controls';

        const prev = document.createElement('button');
        prev.className = 'point-map__arrow';
        prev.type = 'button';
        prev.setAttribute('aria-label', '前の画像へ');
        prev.textContent = '←';

        const tabs = document.createElement('div');
        tabs.className = 'point-map__tabs';

        const next = document.createElement('button');
        next.className = 'point-map__arrow';
        next.type = 'button';
        next.setAttribute('aria-label', '次の画像へ');
        next.textContent = '→';

        controls.appendChild(prev);
        controls.appendChild(tabs);
        controls.appendChild(next);
        map.appendChild(controls);

        sections.forEach((section, sectionIndex) => {
            const tab = document.createElement('button');
            tab.className = 'point-map__tab';
            tab.type = 'button';
            tab.textContent = section.label || section.title || `IMAGE ${sectionIndex + 1}`;
            tab.addEventListener('click', () => activatePointSection(map, sectionIndex));
            tabs.appendChild(tab);
        });

        prev.addEventListener('click', () => {
            const current = Number(map.dataset.activeSection || 0);
            activatePointSection(map, (current - 1 + sections.length) % sections.length);
        });

        next.addEventListener('click', () => {
            const current = Number(map.dataset.activeSection || 0);
            activatePointSection(map, (current + 1) % sections.length);
        });
    }

    const stage = document.createElement('div');
    stage.className = 'point-map__stage';

    sections.forEach((section, sectionIndex) => {
        const slide = document.createElement('div');
        slide.className = 'point-map__slide';

        if (section.notes && section.notes.length > 0) {
            const notes = document.createElement('div');
            notes.className = 'point-map__notes';

            section.notes.forEach(note => {
                const noteItem = document.createElement('article');
                noteItem.className = 'point-map__note';
                const isInlineImageLayout = !['below', 'grid', 'small'].includes(note.imageLayout);
                if (note.images && note.images.length > 0 && isInlineImageLayout) {
                    noteItem.classList.add('point-map__note--with-images');
                }

                const noteBody = document.createElement('div');
                noteBody.className = 'point-map__note-body';

                const noteLabel = document.createElement('p');
                noteLabel.className = 'point-map__note-label';
                noteLabel.textContent = note.label || 'NOTE';

                const noteTitle = document.createElement('h3');
                noteTitle.className = 'point-map__note-title';
                noteTitle.textContent = note.title;

                const noteText = document.createElement('p');
                noteText.className = 'point-map__note-text';
                noteText.textContent = note.description;

                noteBody.appendChild(noteLabel);
                noteBody.appendChild(noteTitle);
                noteBody.appendChild(noteText);
                noteItem.appendChild(noteBody);

                if (note.images && note.images.length > 0) {
                    const noteImages = document.createElement('div');
                    noteImages.className = 'point-map__note-images';
                    if (note.imageLayout) {
                        noteImages.classList.add(`point-map__note-images--${note.imageLayout}`);
                    }

                    note.images.forEach(src => {
                        const img = document.createElement('img');
                        img.src = src;
                        img.alt = `${note.title}の参考画像`;
                        noteImages.appendChild(img);
                    });

                    noteItem.appendChild(noteImages);
                }

                notes.appendChild(noteItem);
            });

            slide.appendChild(notes);
        }

        const imageWrap = document.createElement('div');
        imageWrap.className = 'point-map__image-wrap';
        if (section.imageFit) {
            imageWrap.classList.add(`point-map__image-wrap--${section.imageFit}`);
        }
        if (section.imageDisplay) {
            imageWrap.classList.add(`point-map__image-wrap--${section.imageDisplay}`);
        }

        const sectionImages = Array.isArray(section.images) && section.images.length > 0
            ? section.images
            : [section.image];

        if (sectionImages.length > 1) {
            imageWrap.classList.add('point-map__image-wrap--multiple');
        }

        sectionImages.filter(Boolean).forEach((src, imageIndex) => {
            const img = document.createElement('img');
            img.className = 'point-map__image';
            img.src = src;
            img.alt = `${project.title} ${section.label || section.title || ''}の画面画像 ${imageIndex + 1}`;
            imageWrap.appendChild(img);
        });

        (section.points || []).forEach((point, pointIndex) => {
            const detail = project.designDetails[point.detailIndex];
            if (!detail) {
                return;
            }

            const button = document.createElement('button');
            button.className = 'point-map__marker';
            button.type = 'button';
            button.style.setProperty('--point-x', `${point.x}%`);
            button.style.setProperty('--point-y', `${point.y}%`);
            button.setAttribute('aria-label', `POINT ${String(pointIndex + 1).padStart(2, '0')}：${detail.title}`);
            button.setAttribute('aria-haspopup', 'dialog');
            const ringId = `point-ring-${sectionIndex}-${pointIndex}`;
            button.innerHTML = `
                <svg class="point-map__ring" viewBox="0 0 120 120" aria-hidden="true">
                    <defs>
                        <path id="${ringId}" d="M60,60 m-53,0 a53,53 0 1,1 106,0 a53,53 0 1,1 -106,0"></path>
                    </defs>
                    <text>
                        <textPath href="#${ringId}" startOffset="0">
                            CLICK CLICK CLICK CLICK CLICK CLICK CLICK CLICK CLICK CLICK
                        </textPath>
                    </text>
                </svg>
                <span>POINT</span>
            `;

            button.addEventListener('click', () => {
                openDesignModal(modal, detail, pointIndex);
            });

            imageWrap.appendChild(button);
        });

        slide.appendChild(imageWrap);
        stage.appendChild(slide);
    });

    map.appendChild(stage);
    activatePointSection(map, 0);

    return map;
}

function getPointMapFallbackImage(project) {
    if (project.pointImage) {
        return project.pointImage;
    }

    if (Array.isArray(project.image)) {
        return project.image.find(Boolean) || '';
    }

    if (project.image) {
        return project.image;
    }

    const detailWithImage = project.designDetails?.find(detail => detail.images && detail.images.length > 0);
    return detailWithImage ? detailWithImage.images[0] : '';
}

function getDefaultPointPosition(index, total) {
    const columns = Math.min(3, Math.max(1, total));
    const rows = Math.ceil(total / columns);
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = columns === 1 ? 50 : 24 + (column * (52 / Math.max(1, columns - 1)));
    const y = rows === 1 ? 50 : 24 + (row * (52 / Math.max(1, rows - 1)));

    return { x, y };
}

function activatePointSection(map, activeIndex) {
    map.dataset.activeSection = String(activeIndex);

    map.querySelectorAll('.point-map__slide').forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.toggleAttribute('hidden', !isActive);
    });

    map.querySelectorAll('.point-map__tab').forEach((tab, index) => {
        const isActive = index === activeIndex;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-pressed', String(isActive));
    });
}

function createDesignModal() {
    const modal = document.createElement('div');
    modal.className = 'design-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="design-modal__overlay" data-modal-close></div>
        <div class="design-modal__panel" tabindex="-1">
            <button class="design-modal__close" type="button" aria-label="閉じる" data-modal-close>×</button>
            <p class="design-modal__label"></p>
            <h3 class="design-modal__title"></h3>
            <div class="design-modal__images"></div>
            <p class="design-modal__text"></p>
        </div>
    `;

    modal.querySelectorAll('[data-modal-close]').forEach(element => {
        element.addEventListener('click', () => closeDesignModal(modal));
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeDesignModal(modal);
        }
    });

    document.body.appendChild(modal);
    return modal;
}

function openDesignModal(modal, detail, index) {
    const label = modal.querySelector('.design-modal__label');
    const title = modal.querySelector('.design-modal__title');
    const text = modal.querySelector('.design-modal__text');
    const images = modal.querySelector('.design-modal__images');
    const panel = modal.querySelector('.design-modal__panel');

    label.textContent = `POINT ${String(index + 1).padStart(2, '0')}`;
    title.textContent = detail.title;
    text.textContent = detail.description;
    images.innerHTML = '';
    images.className = 'design-modal__images';
    modal.classList.remove('design-modal--has-images');

    if (detail.modalImageLayout) {
        images.classList.add(`design-modal__images--${detail.modalImageLayout}`);
    }

    if (detail.images && detail.images.length > 0) {
        modal.classList.add('design-modal--has-images');
        detail.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = `${detail.title}の参考画像`;
            images.appendChild(img);
        });
        images.style.display = '';
    } else {
        images.style.display = 'none';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-modal-open');
    panel.focus();
}

function closeDesignModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-modal-open');
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    // data-page属性を設定（パズルピースの色選択用）
    document.body.setAttribute('data-page', 'project-detail');

    loadProjectData();
});
// ===================================
// 落ちるパズルピースのアニメーション
// ===================================

const puzzleImages = [
    'blue@2x.webp',
    'green@2x.webp',
    'lightblue@2x.webp',
    'lightgreen@2x.webp',
    'navy@2x.webp',
    'orange@2x.webp',
    'pink@2x.webp',
    'purple@2x.webp',
    'red@2x.webp',
    'yellow@2x.webp'
];

function createFallingPuzzles() {
    const container = document.getElementById('falling-puzzles');
    if (!container) return;

    // ページごとに使用する色を決定
    const pageName = document.body.getAttribute('data-page') || 'home';
    let selectedPuzzle;

    if (pageName === 'profile') {
        // Profileページ: ランダムに1色選択
        selectedPuzzle = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    } else if (pageName === 'project-detail') {
        // Project Detailページ: ランダムに1色選択
        selectedPuzzle = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
    } else {
        // Homeページ: オレンジ固定
        selectedPuzzle = 'orange@2x.webp';
    }

    // 10個のパズルピースを生成
    for (let i = 0; i < 10; i++) {
        const piece = document.createElement('div');
        piece.className = 'falling-puzzles__piece';

        const img = document.createElement('img');
        img.src = `images/${selectedPuzzle}`;
        img.alt = 'Puzzle piece';

        piece.appendChild(img);

        // ランダムな位置とアニメーション設定
        const leftPosition = Math.random() * 100;
        const rotation = Math.random() * 360;
        const scale = 0.5 + Math.random() * 0.8;
        const delay = Math.random() * 5;
        const duration = 15 + Math.random() * 10;

        piece.style.left = `${leftPosition}%`;
        piece.style.transform = `rotate(${rotation}deg) scale(${scale})`;
        piece.style.animationDelay = `${delay}s`;
        piece.style.animationDuration = `${duration}s`;

        container.appendChild(piece);
    }
}

// ===================================
// スクロールトップボタン
// ===================================

function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;

    // スクロール時の表示/非表示
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight / 2) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // クリック時のスクロール
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// 現在の年を表示
// ===================================

function displayCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// ===================================
// スムーススクロール
// ===================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#!') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// 初期化
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    createFallingPuzzles();
    initScrollToTop();
    displayCurrentYear();
    initSmoothScroll();
});
