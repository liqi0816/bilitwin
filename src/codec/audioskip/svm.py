import itertools
import re

import numpy as np
import sklearn
from matplotlib import pyplot as plt
from sklearn.externals import joblib
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.svm import SVC

import dataset

EXISTING_MODEL_FILENAME = 'zsvm.pkl'


def plot_confusion_matrix(cm, classes,
                          normalize=False,
                          title='Confusion matrix',
                          cmap=plt.cm.Blues):
    """
    This function prints and plots the confusion matrix.
    Normalization can be applied by setting `normalize=True`.
    """
    if normalize:
        cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]

    plt.imshow(cm, interpolation='nearest', cmap=cmap)
    plt.title(title)
    plt.colorbar()
    tick_marks = np.arange(len(classes))
    plt.xticks(tick_marks, classes)
    plt.yticks(tick_marks, classes)

    fmt = '.2f' if normalize else 'd'
    thresh = cm.max() / 2.
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        plt.text(j, i, format(cm[i, j], fmt),
                 horizontalalignment="center",
                 color="white" if cm[i, j] > thresh else "black")

    plt.tight_layout()
    plt.xlabel('Predicted label')
    plt.ylabel('True label')


def plot_feature_contributions(clf, features_names):
    '''
    this function plots the most discrimitive features of the classifier
    '''
    plt.bar(features_names, clf.coef_[0], alpha=0.2)
    plt.title('SVM(linear): feature-contributions')
    plt.xlabel('feature')
    plt.ylabel('contribution')


def main():
    X_train, y_train, _, X_test, y_test, trace_test, _, features_names = dataset.load_model_input()
    # X_train, X_test, y_train, y_test = train_test_split(np.concatenate((X_train, X_test)), np.concatenate((y_train, y_test)), test_size=0.33, random_state=42)

    try:
        clf = joblib.load(EXISTING_MODEL_FILENAME)
        print('>> existing model loaded')
    except IOError:
        print('>> no saved model found\n>> fitting...')
        param_grid = {'C': 10. ** np.arange(10), 'gamma': 10. ** np.arange(-10, 0)}
        clf = GridSearchCV(SVC(kernel='linear', class_weight='balanced'), param_grid)
        clf.fit(X_train, y_train)
        print(f'>> GridSearchCV optimization result: {clf.best_params_}')
        clf = clf.best_estimator_
        joblib.dump(clf, EXISTING_MODEL_FILENAME)

    pred_test = clf.predict(X_test)
    print(f'train accuracy={clf.score(X_train, y_train)}')
    print(f'test accuracy={clf.score(X_test, y_test)}')

    plt.figure()
    cnf_matrix = confusion_matrix(y_test, pred_test) / len(y_test)
    plot_confusion_matrix(cnf_matrix, classes=dataset.CLASS_NAMES, normalize=True)

    failed_cases = np.array(trace_test)
    failed_cases = failed_cases[np.where(y_test != pred_test)[0]]
    failed_cases = sorted(failed_cases, key=lambda x: tuple(map(
        int, re.match(r'(\d+)-.*_(\d+)', x[0]).groups()))
    )

    for (wav_filename, class_name) in failed_cases:
        print(f'({class_name}) {wav_filename}: classification failed')

    try:
        plt.figure()
        plot_feature_contributions(clf, features_names)
    except AttributeError:
        pass

    plt.show()


if __name__ == '__main__':
    main()
