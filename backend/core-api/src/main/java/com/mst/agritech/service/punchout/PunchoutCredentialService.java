package com.mst.agritech.service.punchout;

import com.mst.agritech.domain.entity.PunchoutCredential;
import com.mst.agritech.dto.punchout.PunchoutCredentialRequest;
import com.mst.agritech.dto.punchout.PunchoutCredentialResponse;
import com.mst.agritech.exception.ConflictException;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.PunchoutCredentialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PunchoutCredentialService {

    private final PunchoutCredentialRepository repository;

    @Transactional(readOnly = true)
    public List<PunchoutCredentialResponse> list() {
        return repository.findAllByOrderByBuyerNameAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PunchoutCredentialResponse create(PunchoutCredentialRequest request) {
        validateRequired(request);
        String domain = request.getDomain().trim();
        String identity = request.getIdentity().trim();
        repository.findByDomainAndIdentity(domain, identity).ifPresent(c -> {
            throw new ConflictException("A credential with this domain and identity already exists");
        });
        if (request.getSharedSecret() == null || request.getSharedSecret().isBlank()) {
            throw new ConflictException("A shared secret is required");
        }
        PunchoutCredential credential = PunchoutCredential.builder()
                .buyerName(request.getBuyerName().trim())
                .domain(domain)
                .identity(identity)
                .sharedSecret(request.getSharedSecret().trim())
                .protocol(normalizeProtocol(request.getProtocol()))
                .active(request.getActive() == null || request.getActive())
                .build();
        return toResponse(repository.save(credential));
    }

    @Transactional
    public PunchoutCredentialResponse update(Long id, PunchoutCredentialRequest request) {
        PunchoutCredential credential = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PunchOut credential", id));

        if (request.getBuyerName() != null && !request.getBuyerName().isBlank())
            credential.setBuyerName(request.getBuyerName().trim());
        if (request.getDomain() != null && !request.getDomain().isBlank())
            credential.setDomain(request.getDomain().trim());
        if (request.getIdentity() != null && !request.getIdentity().isBlank())
            credential.setIdentity(request.getIdentity().trim());
        if (request.getProtocol() != null && !request.getProtocol().isBlank())
            credential.setProtocol(normalizeProtocol(request.getProtocol()));
        if (request.getActive() != null)
            credential.setActive(request.getActive());
        // A blank shared secret keeps the existing one
        if (request.getSharedSecret() != null && !request.getSharedSecret().isBlank())
            credential.setSharedSecret(request.getSharedSecret().trim());

        repository.findByDomainAndIdentity(credential.getDomain(), credential.getIdentity())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new ConflictException("Another credential already uses this domain and identity"); });

        return toResponse(repository.save(credential));
    }

    @Transactional
    public void delete(Long id) {
        PunchoutCredential credential = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PunchOut credential", id));
        repository.delete(credential);
    }

    private void validateRequired(PunchoutCredentialRequest request) {
        if (request.getBuyerName() == null || request.getBuyerName().isBlank()
                || request.getDomain() == null || request.getDomain().isBlank()
                || request.getIdentity() == null || request.getIdentity().isBlank()) {
            throw new ConflictException("Buyer name, domain and identity are required");
        }
    }

    private String normalizeProtocol(String protocol) {
        if (protocol == null || protocol.isBlank()) return "CXML";
        String p = protocol.trim().toUpperCase();
        return ("OCI".equals(p) || "CXML".equals(p)) ? p : "CXML";
    }

    private PunchoutCredentialResponse toResponse(PunchoutCredential c) {
        return PunchoutCredentialResponse.builder()
                .id(c.getId())
                .buyerName(c.getBuyerName())
                .domain(c.getDomain())
                .identity(c.getIdentity())
                .protocol(c.getProtocol())
                .active(c.isActive())
                .hasSecret(c.getSharedSecret() != null && !c.getSharedSecret().isBlank())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
