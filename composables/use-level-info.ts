import type { LevelInfo, LevelInfoPage } from '@/circuits';

const isOpen = ref(false);
const page = ref(0);
const completedAvailable = ref(false);

export default function useLevelInfo() {
  const { circuitFactory } = injectCircuitSimulation();

  const title = computed<string>(() => {
    const { info, infoCompleted } = circuitFactory.value;
    if (page.value >= lengthIntroPages.value && completedAvailable.value) {
      return infoCompleted?.title ?? '';
    } else {
      return info?.title ?? '';
    }
  });

  const lengthIntroPages = computed<number>(() => {
    const { info } = circuitFactory.value;
    return info?.pages?.length ?? 0;
  });

  const lengthCompletedPages = computed<number>(() => {
    const { infoCompleted } = circuitFactory.value;
    return infoCompleted?.pages?.length ?? 0;
  });

  const lengthAllPages = computed<number>(() => {
    return lengthIntroPages.value + lengthCompletedPages.value;
  });

  const lengthAvailablePages = computed<number>(() => {
    if (completedAvailable.value) {
      return lengthAllPages.value;
    } else {
      return lengthIntroPages.value;
    }
  });

  const levelInfo = computed<LevelInfo | undefined>(() => {
    if (page.value >= lengthIntroPages.value) {
      if (completedAvailable.value) {
        return circuitFactory.value.infoCompleted;
      } else {
        return undefined;
      }
    } else {
      return circuitFactory.value.info;
    }
  });

  const levelInfoPage = computed<LevelInfoPage | undefined>(() => {
    if (page.value >= lengthIntroPages.value) {
      if (completedAvailable.value) {
        return circuitFactory.value.infoCompleted?.pages?.[
          page.value - lengthIntroPages.value
        ];
      } else {
        return undefined;
      }
    } else {
      return circuitFactory.value.info?.pages?.[page.value];
    }
  });

  const nextLevelId = computed<string | undefined>(() => {
    if (completedAvailable.value) {
      return circuitFactory.value.nextLevelID;
    } else {
      return undefined;
    }
  });

  const contentHtml = computed<string>(() => {
    return levelInfoPage.value?.contentHtml ?? '';
  });

  function goTo(toPage: number) {
    if (toPage >= 0 && toPage < lengthAvailablePages.value) {
      page.value = toPage;
    }
  }

  function next() {
    goTo(page.value + 1);
  }

  function previous() {
    goTo(page.value - 1);
  }

  function close() {
    isOpen.value = false;
  }

  function open() {
    if (page.value < lengthAvailablePages.value) {
      isOpen.value = true;
    }
  }

  function openCompleted() {
    completedAvailable.value = true;
    goTo(lengthIntroPages.value);
    open();
  }

  watch(circuitFactory, () => {
    page.value = 0;
    completedAvailable.value = false;
    if (circuitFactory.value.info) {
      open();
    } else {
      close();
    }
  });

  return {
    isOpen: readonly(isOpen),
    completedAvailable: readonly(completedAvailable),
    page: readonly(page),
    title,
    contentHtml,
    levelInfo,
    levelInfoPage,
    lengthIntroPages,
    lengthCompletedPages,
    lengthAllPages,
    lengthAvailablePages,
    nextLevelId,
    close,
    open,
    openCompleted,
    next,
    previous,
    goTo,
  };
}
