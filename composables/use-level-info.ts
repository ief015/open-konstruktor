import type { LevelInfo, LevelInfoPage } from "@/circuits";

const { circuitFactory } = useCircuitSimulator();

const isOpen = ref(false);
const page = ref(0);
const completedAvailable = ref(false);

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
  return info?.pages.length ?? 0;
});

const lengthCompletedPages = computed<number>(() => {
  const { infoCompleted } = circuitFactory.value;
  return infoCompleted?.pages.length ?? 0;
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

const levelInfo = computed<LevelInfo|undefined>(() => {
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

const levelInfoPage = computed<LevelInfoPage|undefined>(() => {
  if (page.value >= lengthIntroPages.value) {
    if (completedAvailable.value) {
      return circuitFactory.value.infoCompleted?.pages[page.value - lengthIntroPages.value];
    } else {
      return undefined;
    }
  } else {
    return circuitFactory.value.info?.pages[page.value];
  }
});

const nextLevelId = computed<string|undefined>(() => {
  if (completedAvailable.value) {
    console.log(circuitFactory.value.nextLevelID);
    return circuitFactory.value.nextLevelID;
  } else {
    return undefined;
  }
});

const contentHtml = computed<string>(() => {
  return levelInfoPage.value?.contentHtml ?? '';
});

const goTo = (toPage: number) => {
  if (toPage >= 0 && toPage < lengthAvailablePages.value) {
    page.value = toPage;
  }
}

const next = () => {
  goTo(page.value + 1);
}

const previous = () => {
  goTo(page.value - 1);
}

const close = () => {
  isOpen.value = false;
}

const open = () => {
  if (page.value < lengthAvailablePages.value) {
    isOpen.value = true;
  }
}

const openCompleted = () => {
  completedAvailable.value = true;
  goTo(lengthIntroPages.value);
  open();
}

export default function useLevelInfo() {

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