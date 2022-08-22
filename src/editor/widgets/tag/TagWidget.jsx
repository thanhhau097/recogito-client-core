import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { CloseIcon } from '../../../Icons';
import i18n from '../../../i18n';
import Select from 'react-select';

import Autocomplete from '../Autocomplete';

const getDraftTag = existingDraft =>
  existingDraft ? existingDraft : {
    type: 'TextualBody', value: '', purpose: 'tagging', draft: true
  };

const TagWidget = props => {

  // All tags (draft + non-draft)
  const all = props.annotation ? 
    props.annotation.bodies.filter(b => b.purpose === 'tagging') : [];

  // Last draft tag goes into the input field
  const draftTag = getDraftTag(all.slice().reverse().find(b => b.draft)); 

  // All except draft tag
  const tags = all.filter(b => b != draftTag);
  const tags = all.filter(b => b != draftTag);
  const isDropdown = props.dropdown && props.vocabulary ? true : false;
  if (isDropdown){
    var mappedTags = [];
    var selectedTag = {};
    for (var vo=0; vo<props.vocabulary.length; vo++){
      const vocab = props.vocabulary[vo];
      const label = vocab.label ? vocab.label : vocab;
      const uri = vocab.uri ? vocab.uri : '';
      const optionDict = {'label': label, 'value': label, 'uri': uri}
      mappedTags.push(optionDict);
      if (tags.length > 0 && tags[0]['value'] == label){
        selectedTag = optionDict;
      }
    }
  }

  const [ showDelete, setShowDelete ] = useState(false);

  const toggle = tag => _ => {
    if (showDelete === tag) // Removes delete button
      setShowDelete(false);
    else
      setShowDelete(tag); // Sets delete button on a different tag
  }

  const onDraftChange = value => {
    const prev = draftTag.value.trim();
    const updated = value.trim();

    if (prev.length === 0 && updated.length > 0) {
      props.onAppendBody({ ...draftTag, value: updated });
    } else if (prev.length > 0 && updated.length === 0) {
      props.onRemoveBody(draftTag);
    } else {
      props.onUpdateBody(draftTag, { ...draftTag, value: updated });
    }
  }

  const onDelete = tag => evt => {
    evt.stopPropagation();
    props.onRemoveBody(tag);
  }

  const onSubmit = tag => {
    const toSubmit = tag.uri ? {
        type: 'SpecificResource',
        purpose: 'tagging',
        source: {
          id: tag.uri,
          label: tag.label
        }
      } : {
        type: 'TextualBody',
        purpose: 'tagging',
        value: tag.label || tag
      };

    const dropdowncheck = isDropdown ? tags.length == 0 : true;

    if (draftTag.value.trim().length === 0 && dropdowncheck) {
      props.onAppendBody(toSubmit);
    } else if (isDropdown) {
      props.onUpdateBody(tags[0], toSubmit);
    }
    else {
      props.onUpdateBody(draftTag, toSubmit); 
    }
  }

  // Shorthand
  const tagValue = tag => tag.value || tag.source.label;

  return (
    <div className="r6o-widget r6o-tag">
      { tags.length > 0 && !isDropdown &&
        <ul className="r6o-taglist">
          { tags.map(tag =>
            <li key={tagValue(tag)} onClick={toggle(tag)}>
              <span className="r6o-label">{tagValue(tag)}</span>

              {!props.readOnly &&
                <CSSTransition in={showDelete === tag} timeout={200} classNames="r6o-delete">
                  <span className="r6o-delete-wrapper" onClick={onDelete(tag)}>
                    <span className="r6o-delete">
                      <CloseIcon width={12} />
                    </span>
                  </span>
                </CSSTransition>
              }
            </li>
          )}
        </ul>
      }

      {!props.readOnly && isDropdown &&
        <Select
          onChange={onSubmit}
          options={mappedTags}
          value={selectedTag}
        />
      }
      {!props.readOnly && !isDropdown &&
        <Autocomplete 
          focus={props.focus}
          placeholder={i18n.t('Add tag...')}
          vocabulary={props.vocabulary || []}
          onChange={onDraftChange}
          onSubmit={onSubmit}/>
      }
    </div>
  )

}

export default TagWidget;