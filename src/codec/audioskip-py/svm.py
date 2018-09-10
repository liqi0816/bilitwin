import itertools
import re

import numpy as np
import sklearn
from matplotlib import pyplot as plt
from sklearn.externals import joblib
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import (GridSearchCV, LeaveOneGroupOut,
                                     cross_val_predict, cross_validate,
                                     train_test_split, GroupKFold)
from sklearn.svm import SVC

import dataset

EXISTING_MODEL_FILENAME = 'zsvm.pkl'


def plot_confusion_matrix(cm, classes,
                          normalize=False,
                          title='Confusion matrix',
                          # pylint: disable=E1101
                          cmap=plt.cm.Blues):
    """
    This function plots the confusion matrix.
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
    model_input = dataset.load_model_input()
    X = np.concatenate(tuple(x['X'] for x in model_input))
    y = np.concatenate(tuple(x['y'] for x in model_input))
    groups = np.concatenate(tuple(np.full(len(x['X']), x['sample_name']) for x in model_input))
    trace = np.concatenate(tuple(x['trace'] for x in model_input))
    features_names = model_input[0]['features_names']

    ''' PICKPICK '''
    PICKPICK = np.where(np.isin(features_names, USED_FEATURES))[0]
    features_names = np.array(features_names)[PICKPICK]
    X = X[:,PICKPICK]
    ''' PICKPICK END '''

    try:
        clf = joblib.load(EXISTING_MODEL_FILENAME)
        print('>> saved model loaded')
    except IOError:
        print('>> saved model not found\n>> fitting...')
        param_grid = {'C': 10. ** np.arange(1), 'gamma': 10. ** np.arange(-10, -8)}
        clf = GridSearchCV(SVC(kernel='linear', class_weight='balanced'), param_grid, cv=GroupKFold(n_splits=3).split(X, y, groups))
        clf.fit(X, y)
        print(f'>> GridSearchCV optimization result: {clf.best_params_}')
        clf = clf.best_estimator_
        joblib.dump(clf, EXISTING_MODEL_FILENAME)

    predict = cross_val_predict(clf, X, y, cv=LeaveOneGroupOut().split(X, y, groups))

    plt.figure()
    plot_confusion_matrix(confusion_matrix(y, predict), classes=dataset.CLASS_NAMES, normalize=True)

    failed_cases = np.array(np.column_stack((groups, trace)))[np.where(y != predict)[0]]
    failed_cases = sorted(failed_cases, key=lambda x: (
        int(re.match(r'\d+', x[0]).group()),
        x[1],
        int(re.search(r'\d+', x[2]).group())
    ))
    for (sample_name, class_name, wav_filename) in failed_cases:
        print(f'({class_name}) {sample_name} {wav_filename}: classification failed')

    scores = cross_validate(clf, X, y, scoring=('precision_macro', 'recall_macro', 'f1_macro'), return_train_score=True, cv=LeaveOneGroupOut().split(X, y, groups))
    print(f'TRAIN precision = {scores["train_precision_macro"].mean()} (+/- {scores["train_precision_macro"].std() * 2})')
    print(f'TRAIN recall = {scores["train_recall_macro"].mean()} (+/- {scores["train_recall_macro"].std() * 2})')
    print(f'TRAIN f1 = {scores["train_f1_macro"].mean()} (+/- {scores["train_f1_macro"].std() * 2})')
    print(f'TEST precision = {scores["test_precision_macro"].mean()} (+/- {scores["test_precision_macro"].std() * 2})')
    print(f'TEST recall = {scores["test_recall_macro"].mean()} (+/- {scores["test_recall_macro"].std() * 2})')
    print(f'TEST f1 = {scores["test_f1_macro"].mean()} (+/- {scores["test_f1_macro"].std() * 2})')

    try:
        clf.coef_
        plt.figure()
        plot_feature_contributions(clf, features_names)
    except AttributeError:
        pass

    plt.show()


if __name__ == '__main__':
    # USED_FEATURES = ['spectro']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'
    # main()
    # USED_FEATURES = ['melspectro']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'
    # main()
    # USED_FEATURES = ['spectro', 'melspectro']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'    
    # main()
    # USED_FEATURES = ['contrast']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    # USED_FEATURES = ['spectro', 'contrast']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    # USED_FEATURES = ['melspectro', 'contrast']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'   
    # main()
    # USED_FEATURES = ['spectro', 'melspectro', 'contrast']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'   
    # main()
    # USED_FEATURES = ['mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'   
    # main()
    # USED_FEATURES = ['spectro', 'mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    # USED_FEATURES = ['melspectro', 'mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    # USED_FEATURES = ['spectro', 'melspectro', 'mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl' 
    # main()
    # USED_FEATURES = ['contrast', 'mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    # USED_FEATURES = ['spectro', 'contrast', 'mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    # USED_FEATURES = ['melspectro', 'contrast', 'mfcc']
    # EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    # main()
    USED_FEATURES = ['spectro', 'melspectro', 'contrast', 'mfcc']
    EXISTING_MODEL_FILENAME = '_'.join(USED_FEATURES) + '_' + 'zsvm.pkl'  
    main()
