$(() => {
  let taskList = [];
  const TASKS_ON_PAGE = 5;
  let currentTasks = taskList;
  let filterType = 'all';
  let currentPage = 1;
  const $taskText = $('#task-text');
  const $selectAll = $('#select-all');
  const $tabSelector = $('.tab-selector');
  const shieldingInput = (input) => (
    input.replace(/\u0026/gu, '&amp;')
      .replace(/\u003C/gu, '&lt;')
      .replace(/\u003E/gu, '&gt;')
      .replace(/\u0022/gu, '&quot;')
      .replace(/\u0027/gu, '&#x27;')
      .replace(/\u002F/gu, '&#x2F;')
  );

  const giveValue = () => {
    const CURRENT_VALUE = shieldingInput($taskText.val().trim());
    if (CURRENT_VALUE !== '') {
      const objectValue = {
        taskValue: CURRENT_VALUE,
        id: Date.now(),
        check: false,
      };
      taskList.push(objectValue);
      currentPage = Number(Math.ceil(taskList.length / TASKS_ON_PAGE));
      filterType = 'all';
      $taskText.val('');
    }
  };
  const isAllChecked = () => taskList.length && taskList.every((item) => item.check);

  const checkAllValue = () => {
    const test = isAllChecked();
    if (test) {
      $selectAll.addClass('btn-danger');
    } else {
      $selectAll.removeClass('btn-danger');
    }
  };

  const countOfTasks = () => {
    const countTask = taskList.length;
    const countDone = taskList.filter((item) => item.check).length;
    const countNotDone = taskList.filter((item) => !item.check).length;
    let divRender = '';
    if (countTask >= 1) {
      divRender += `<div class = 'counter-of-tasks'>${countDone} Tasks done. ${countTask} Tasks. ${countNotDone} Tasks not done.</div>`;
    }
    $('#counted-tasks').html(divRender);
  };
  const currentCountOfPages = () => Math.ceil(currentTasks.length / TASKS_ON_PAGE);
  const pagination = () => {
    let button = '';
    const countOfPages = currentCountOfPages();
    if (currentTasks.length >= 1) {
      for (let pageNumber = 1; pageNumber <= countOfPages; pageNumber += 1) {
        button += `<button class="page-number btn ${(pageNumber === currentPage) ? 'btn-primary' : 'outline-secondary'} " value = '${pageNumber}':> ${pageNumber}   </button>`;
      }
    }
    $('#pages-list').html(button);
  };

  const slicer = () => {
    if (filterType === 'completed') {
      currentTasks = taskList.filter((item) => item.check);
    } else if (filterType === 'active') {
      currentTasks = taskList.filter((item) => !item.check);
    } else (currentTasks = taskList);
  };

  const prerender = () => {
    const START = (currentPage - 1) * TASKS_ON_PAGE;
    const END = START + TASKS_ON_PAGE;
    const RENDER_LIST = currentTasks.slice(START, END).map((item) => (
      `
        <li id="${item.id}" class='list-element list-group-item d-flex row justify-content-center align-items-center' value='${item.taskValue}'>
          <input class='check-box col-1' type='checkbox' ${(item.check) && 'checked'} >
          <span class="col-8">${item.taskValue}</span>
          <button class='col delete-object btn btn-outline-danger'>delete</button>
        </li>
      `
    ));
    $('#list-ul').html(RENDER_LIST);
  };

  const coloringTabs = () => {
    $tabSelector.removeClass('btn-danger');
    $(`#${filterType}-tasks`).addClass('btn-danger');
  };

  const lastPageCheck = () => {
    slicer();
    const countOfPages = currentCountOfPages();
    if (currentPage > countOfPages) {
      currentPage = countOfPages;
    }
  };
  const render = () => {
    slicer();
    prerender();
    coloringTabs();
    pagination();
  };
  const addingAll = () => {
    giveValue();
    checkAllValue();
    countOfTasks();
    render();
    lastPageCheck();
  };
  const changingTask = () => {
    const TEXT = shieldingInput($('.edit-task').val().trim());
    const CHECK_ID = Number($('.edit-task').attr('id'));
    taskList = taskList.map((item) => {
      const CURRENT_ITEM = item;
      if (CURRENT_ITEM.id === CHECK_ID && TEXT !== '') {
        CURRENT_ITEM.taskValue = TEXT;
      }
      return item;
    });
    render();
  };
  const checkCountRender = () => {
    checkAllValue();
    countOfTasks();
    render();
  };
  $(document).on('click', '.page-number', function () {
    currentPage = Number($(this).attr('value'));
    render();
  });

  $(document).on('change', '.check-box', function () {
    const CHECK_ID = Number($(this).parent().attr('id'));
    taskList = taskList.map((item) => {
      const CURRENT_ITEM = item;
      if (CURRENT_ITEM.id === CHECK_ID) {
        CURRENT_ITEM.check = $(this).prop('checked');
      }
      return item;
    });

    lastPageCheck();
    checkAllValue();
    addingAll();
  });

  $(document).on('dblclick', '.list-element', function () {
    const REPLACING_INPUT = `<input class="edit-task form-control"  id='${$(this).attr('id')}' value='${$(this).attr('value')}'>`;
    $(this).replaceWith(REPLACING_INPUT);
    $('.edit-task').focus();
  });

  $(document).on('blur', '.edit-task', () => {
    changingTask();
  });

  $(document).on('keypress', '.edit-task', (event) => {
    if (event.key === 'Enter') {
      changingTask();
    }
  });

  $tabSelector.on('click', function () {
    if ($(this).attr('id') === 'completed-tasks') {
      filterType = 'completed';
    } else if ($(this).attr('id') === 'active-tasks') {
      filterType = 'active';
    } else (filterType = 'all');
    currentPage = 1;
    render();
  });

  $(document).on('click', '#delete-Selected', () => {
    taskList = taskList.filter((item) => item.check === false);
    lastPageCheck();
    checkCountRender();
  });

  $(document).on('click', '#select-all', () => {
    taskList = taskList.map((item) => ({ ...item, check: !($selectAll.hasClass('btn-danger')) }));
    checkCountRender();
  });

  $(document).on('click', '.delete-object', function () {
    const CHECK_ID = Number($(this).parent().attr('id'));
    taskList = taskList.filter((item) => !(item.id === CHECK_ID));
    lastPageCheck();
    checkAllValue();
    checkCountRender();
  });

  $('#add-task').on('click', () => {
    addingAll();
  });

  $taskText.on('keypress', (event) => {
    if (event.key === 'Enter') {
      addingAll();
    }
  });
});
